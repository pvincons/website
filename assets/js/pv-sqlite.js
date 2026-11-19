/*!
 * PV INCONS – SQLite helper (dùng chung cho website và admin)
 * ------------------------------------------------------------------
 * Toàn bộ dữ liệu bài viết / cài đặt được lưu trong 1 file SQLite:
 *     content/website.db
 * Trình duyệt đọc/ghi file này bằng sql.js (SQLite biên dịch sang WebAssembly).
 *
 * Bảng trong website.db:
 *     posts_news, posts_projects, posts_services, posts_investment, posts_hr,
 *     posts_partners (công ty thành viên / liên kết / đối tác chuỗi cung ứng – trang chủ)
 *     settings (key/value), meta (thông tin phiên bản)
 *
 * API chính (window.PVDB):
 *     Trang công khai : PVDB.getPosts('news'), PVDB.getSettings()
 *     Admin           : PVDB.openFromBytes / createEmpty / readPosts / writePosts /
 *                       writeSettings / setMeta / exportBytes / bytesToBase64 ...
 *
 * Thư viện sql.js được nạp theo thứ tự: cdnjs -> jsDelivr -> assets/js/vendor/sql.js/
 * (muốn tự host: chép sql-wasm.js + sql-wasm.wasm vào assets/js/vendor/sql.js/).
 * Có thể ép nguồn riêng bằng: window.PV_SQLJS_BASE = 'https://.../sql.js/dist/';
 */
(function (global) {
  'use strict';

  var SELF_SRC = (document.currentScript && document.currentScript.src) || '';
  function rel(p) {
    try { return SELF_SRC ? new URL(p, SELF_SRC).href : p; } catch (e) { return p; }
  }

  var SQLJS_VERSION = '1.8.0';
  var DB_URL = rel('../../database/website.db');       // /database/website.db
  var DB_REPO_PATH = 'database/website.db';            // đường dẫn trong repository GitHub
  var SCHEMA_VERSION = '1';

  // ---------------------------------------------------------------
  // 1. KHAI BÁO CẤU TRÚC BẢNG (phải khớp tools/json_to_sqlite.py)
  // ---------------------------------------------------------------
  var MODULES = {
    partners: {
      table: 'posts_partners',                                                              //   title = tên công ty, image = URL logo, link = website (không bắt buộc)
      cols: ['category', 'categoryLabel', 'date', 'title', 'summary', 'link', 'image']      // Đối tác trang chủ: category = thanh-vien | lien-ket | chuoi-cung-ung
    },
    news: {
      table: 'posts_news',
      cols: ['category', 'categoryLabel', 'date', 'title', 'summary', 'link', 'image']
    },
    projects: {
      table: 'posts_projects',
      cols: ['category', 'categoryLabel', 'date', 'title', 'summary', 'link', 'image',
        'code', 'scale', 'client', 'location', 'architect']
    },
    services: {
      table: 'posts_services',
      cols: ['category', 'categoryLabel', 'date', 'title', 'summary', 'link', 'eyelink', 'code', 'icon']
    },
    investment: {
      table: 'posts_investment',
      cols: ['category', 'categoryLabel', 'date', 'title', 'summary', 'link', 'code', 'icon']
    },
    hr: {
      table: 'posts_hr',
      cols: ['category', 'label', 'categoryLabel', 'date', 'title', 'type', 'deadline',
        'location', 'salary', 'requirement', 'quantity', 'applyLink']
    }
  };

  function q(name) { return '"' + String(name).replace(/"/g, '""') + '"'; }

  function createPostsSql(m) {
    var parts = ['"id" INTEGER PRIMARY KEY'];
    m.cols.forEach(function (c) { parts.push(q(c) + ' TEXT'); });
    parts.push('"extra" TEXT');            // JSON chứa các trường lạ chưa có cột riêng
    parts.push('"sort_order" INTEGER');    // giữ đúng thứ tự mảng JSON gốc
    return 'CREATE TABLE IF NOT EXISTS ' + q(m.table) + ' (' + parts.join(', ') + ')';
  }

  // ---------------------------------------------------------------
  // 2. NẠP sql.js
  // ---------------------------------------------------------------
  var sqlPromise = null;

  function loadScript(src) {
    return new Promise(function (resolve, reject) {
      var s = document.createElement('script');
      s.src = src;
      s.async = true;
      s.onload = function () { resolve(); };
      s.onerror = function () { s.remove(); reject(new Error('Không tải được ' + src)); };
      document.head.appendChild(s);
    });
  }

  function sqlJsBases() {
    var list = [];
    if (global.PV_SQLJS_BASE) list.push(String(global.PV_SQLJS_BASE).replace(/\/?$/, '/'));
    list.push('https://cdnjs.cloudflare.com/ajax/libs/sql.js/' + SQLJS_VERSION + '/');
    list.push('https://cdn.jsdelivr.net/npm/sql.js@' + SQLJS_VERSION + '/dist/');
    list.push(rel('vendor/sql.js/'));
    return list;
  }

  function loadSqlJs() {
    if (sqlPromise) return sqlPromise;
    sqlPromise = (async function () {
      var bases = sqlJsBases();
      var lastErr = null;
      for (var i = 0; i < bases.length; i++) {
        var base = bases[i];
        try {
          await loadScript(base + 'sql-wasm.js');
          return await global.initSqlJs({ locateFile: function (f) { return base + f; } });
        } catch (e) {
          lastErr = e;
        }
      }
      throw lastErr || new Error('Không nạp được thư viện sql.js');
    })();
    sqlPromise.catch(function () { sqlPromise = null; });
    return sqlPromise;
  }

  // ---------------------------------------------------------------
  // 3. TIỆN ÍCH NHỊ PHÂN / BASE64
  // ---------------------------------------------------------------
  function bytesToBase64(u8) {
    var CHUNK = 0x8000, out = '';
    for (var i = 0; i < u8.length; i += CHUNK) {
      out += String.fromCharCode.apply(null, u8.subarray(i, i + CHUNK));
    }
    return btoa(out);
  }

  function base64ToBytes(b64) {
    var bin = atob(String(b64).replace(/\s/g, ''));
    var u8 = new Uint8Array(bin.length);
    for (var i = 0; i < bin.length; i++) u8[i] = bin.charCodeAt(i);
    return u8;
  }

  function isSqliteBytes(u8) {
    if (!u8 || u8.length < 16) return false;
    var magic = 'SQLite format 3\u0000';
    for (var i = 0; i < 16; i++) if (u8[i] !== magic.charCodeAt(i)) return false;
    return true;
  }

  // ---------------------------------------------------------------
  // 4. SCHEMA
  // ---------------------------------------------------------------
  function ensureSchema(db) {
    Object.keys(MODULES).forEach(function (key) {
      var m = MODULES[key];
      db.run(createPostsSql(m));
      // Bổ sung cột còn thiếu nếu file .db được tạo bởi phiên bản cũ hơn
      var info = db.exec('PRAGMA table_info(' + q(m.table) + ')');
      var have = {};
      if (info.length) info[0].values.forEach(function (r) { have[r[1]] = true; });
      m.cols.concat(['extra']).forEach(function (c) {
        if (!have[c]) db.run('ALTER TABLE ' + q(m.table) + ' ADD COLUMN ' + q(c) + ' TEXT');
      });
      if (!have['sort_order']) db.run('ALTER TABLE ' + q(m.table) + ' ADD COLUMN "sort_order" INTEGER');
    });
    db.run('CREATE TABLE IF NOT EXISTS "settings" ("key" TEXT PRIMARY KEY, "value" TEXT, "value_type" TEXT)');
    db.run('CREATE TABLE IF NOT EXISTS "meta" ("key" TEXT PRIMARY KEY, "value" TEXT)');
    var has = db.exec('SELECT 1 FROM "meta" WHERE "key" = \'schema_version\'');
    if (!has.length) setMeta(db, 'schema_version', SCHEMA_VERSION);
  }

  async function createEmpty() {
    var SQL = await loadSqlJs();
    var db = new SQL.Database();
    ensureSchema(db);
    return db;
  }

  async function openFromBytes(bytes) {
    if (!isSqliteBytes(bytes)) throw new Error('Dữ liệu không phải là file SQLite hợp lệ');
    var SQL = await loadSqlJs();
    var db = new SQL.Database(bytes);
    ensureSchema(db);
    return db;
  }

  function exportBytes(db) {
    try { db.run('VACUUM'); } catch (e) { /* không bắt buộc */ }
    return db.export();
  }

  // ---------------------------------------------------------------
  // 5. ĐỌC / GHI BÀI VIẾT
  // ---------------------------------------------------------------
  function readPosts(db, module) {
    var m = MODULES[module];
    if (!m) throw new Error('Module không tồn tại: ' + module);
    var res;
    try {
      res = db.exec('SELECT * FROM ' + q(m.table) + ' ORDER BY "sort_order", "id"');
    } catch (e) {
      return [];
    }
    if (!res.length) return [];
    var cols = res[0].columns;
    return res[0].values.map(function (row) {
      var obj = {}, extra = null;
      cols.forEach(function (c, i) {
        var v = row[i];
        if (c === 'sort_order') return;
        if (c === 'extra') { extra = v; return; }
        if (v === null || v === undefined) return;   // NULL = trường không có trong JSON gốc
        obj[c] = v;
      });
      if (extra) {
        try { Object.assign(obj, JSON.parse(extra)); } catch (e) { /* bỏ qua extra lỗi */ }
      }
      return obj;
    });
  }

  function writePosts(db, module, items) {
    var m = MODULES[module];
    if (!m) throw new Error('Module không tồn tại: ' + module);
    ensureSchema(db);
    items = Array.isArray(items) ? items : [];

    var used = {}, maxId = 0;
    items.forEach(function (it) {
      var n = Number(it && it.id);
      if (isFinite(n) && n > maxId) maxId = n;
    });

    var cols = ['id'].concat(m.cols, ['extra', 'sort_order']);
    var sql = 'INSERT INTO ' + q(m.table) + ' (' + cols.map(q).join(',') + ') VALUES (' +
      cols.map(function () { return '?'; }).join(',') + ')';

    db.run('BEGIN');
    try {
      db.run('DELETE FROM ' + q(m.table));
      var st = db.prepare(sql);
      try {
        items.forEach(function (it, idx) {
          it = it || {};
          var id = Number(it.id);
          if (!isFinite(id) || used[id]) id = ++maxId;     // ID lỗi/trùng -> cấp ID mới
          used[id] = true;

          var row = [id];
          m.cols.forEach(function (c) {
            var v = it[c];
            row.push(v === undefined || v === null ? null : String(v));
          });
          var extra = {};
          Object.keys(it).forEach(function (k) {
            if (k !== 'id' && m.cols.indexOf(k) < 0) extra[k] = it[k];
          });
          row.push(Object.keys(extra).length ? JSON.stringify(extra) : null);
          row.push(idx);
          st.run(row);
        });
      } finally {
        st.free();
      }
      db.run('COMMIT');
    } catch (e) {
      try { db.run('ROLLBACK'); } catch (_) { /* ignore */ }
      throw e;
    }
  }

  // ---------------------------------------------------------------
  // 6. SETTINGS (key.phan_cap -> value) & META
  // ---------------------------------------------------------------
  function flatten(obj, prefix, out) {
    Object.keys(obj).forEach(function (k) {
      var v = obj[k], key = prefix ? prefix + '.' + k : k;
      if (v !== null && typeof v === 'object' && !Array.isArray(v)) {
        flatten(v, key, out);
      } else if (typeof v === 'string') {
        out.push([key, v, 'string']);
      } else if (typeof v === 'number') {
        out.push([key, String(v), 'number']);
      } else if (typeof v === 'boolean') {
        out.push([key, v ? '1' : '0', 'boolean']);
      } else {
        out.push([key, JSON.stringify(v === undefined ? null : v), 'json']);
      }
    });
    return out;
  }

  function writeSettings(db, obj) {
    ensureSchema(db);
    var rows = flatten(obj || {}, '', []);
    db.run('BEGIN');
    try {
      db.run('DELETE FROM "settings"');
      var st = db.prepare('INSERT INTO "settings" ("key","value","value_type") VALUES (?,?,?)');
      try { rows.forEach(function (r) { st.run(r); }); } finally { st.free(); }
      db.run('COMMIT');
    } catch (e) {
      try { db.run('ROLLBACK'); } catch (_) { /* ignore */ }
      throw e;
    }
  }

  function readSettings(db) {
    var res;
    try { res = db.exec('SELECT "key","value","value_type" FROM "settings" ORDER BY "key"'); }
    catch (e) { return {}; }
    var out = {};
    if (!res.length) return out;
    res[0].values.forEach(function (r) {
      var key = r[0], val = r[1], type = r[2], v;
      if (type === 'number') v = Number(val);
      else if (type === 'boolean') v = (val === '1' || val === 'true');
      else if (type === 'json') { try { v = JSON.parse(val); } catch (e) { v = null; } }
      else v = val;
      var parts = String(key).split('.'), node = out;
      for (var i = 0; i < parts.length - 1; i++) {
        if (typeof node[parts[i]] !== 'object' || node[parts[i]] === null) node[parts[i]] = {};
        node = node[parts[i]];
      }
      node[parts[parts.length - 1]] = v;
    });
    return out;
  }

  function setMeta(db, key, value) {
    db.run('INSERT OR REPLACE INTO "meta" ("key","value") VALUES (?,?)', [String(key), String(value)]);
  }

  // ---------------------------------------------------------------
  // 7. DÙNG CHO TRANG CÔNG KHAI (đọc /database/website.db)
  // ---------------------------------------------------------------
  var siteDbPromise = null;

  async function fetchSiteBytes() {
    var res = await fetch(DB_URL, { cache: 'no-cache' });   // luôn kiểm tra bản mới nhất
    if (!res.ok) throw new Error('Không tải được ' + DB_REPO_PATH + ' (HTTP ' + res.status + ')');
    return new Uint8Array(await res.arrayBuffer());
  }

  function openSiteDb() {
    if (!siteDbPromise) {
      siteDbPromise = (async function () {
        var parts = await Promise.all([loadSqlJs(), fetchSiteBytes()]);
        if (!isSqliteBytes(parts[1])) throw new Error(DB_REPO_PATH + ' không phải file SQLite hợp lệ');
        return new parts[0].Database(parts[1]);
      })();
      siteDbPromise.catch(function () { siteDbPromise = null; });
    }
    return siteDbPromise;
  }

  async function getPosts(module) {
    var db = await openSiteDb();
    return readPosts(db, module);
  }

  async function getSettings() {
    var db = await openSiteDb();
    return readSettings(db);
  }

  global.PVDB = {
    DB_URL: DB_URL,
    DB_REPO_PATH: DB_REPO_PATH,
    MODULES: MODULES,
    loadSqlJs: loadSqlJs,
    createEmpty: createEmpty,
    openFromBytes: openFromBytes,
    exportBytes: exportBytes,
    ensureSchema: ensureSchema,
    readPosts: readPosts,
    writePosts: writePosts,
    readSettings: readSettings,
    writeSettings: writeSettings,
    setMeta: setMeta,
    bytesToBase64: bytesToBase64,
    base64ToBytes: base64ToBytes,
    isSqliteBytes: isSqliteBytes,
    openSiteDb: openSiteDb,
    getPosts: getPosts,
    getSettings: getSettings
  };
})(window);
