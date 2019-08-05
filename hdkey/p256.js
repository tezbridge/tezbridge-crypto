module.exports = function (e) {
  var r = {};

  function t(i) {
    if (r[i]) return r[i].exports;
    var n = r[i] = {
      i: i,
      l: !1,
      exports: {}
    };
    return e[i].call(n.exports, n, n.exports, t), n.l = !0, n.exports
  }
  return t.m = e, t.c = r, t.d = function (e, r, i) {
    t.o(e, r) || Object.defineProperty(e, r, {
      enumerable: !0,
      get: i
    })
  }, t.r = function (e) {
    "undefined" != typeof Symbol && Symbol.toStringTag && Object.defineProperty(e, Symbol.toStringTag, {
      value: "Module"
    }), Object.defineProperty(e, "__esModule", {
      value: !0
    })
  }, t.t = function (e, r) {
    if (1 & r && (e = t(e)), 8 & r) return e;
    if (4 & r && "object" == typeof e && e && e.__esModule) return e;
    var i = Object.create(null);
    if (t.r(i), Object.defineProperty(i, "default", {
        enumerable: !0,
        value: e
      }), 2 & r && "string" != typeof e)
      for (var n in e) t.d(i, n, function (r) {
        return e[r]
      }.bind(null, n));
    return i
  }, t.n = function (e) {
    var r = e && e.__esModule ? function () {
      return e.default
    } : function () {
      return e
    };
    return t.d(r, "a", r), r
  }, t.o = function (e, r) {
    return Object.prototype.hasOwnProperty.call(e, r)
  }, t.p = "", t(t.s = 6)
}([function (e, r) {
  e.exports = require("bn.js")
}, function (e) {
  e.exports = {
    f: "private key range is invalid",
    g: "tweak out of range or resulting private key is invalid",
    h: "tweak out of range",
    e: "couldn't export to DER format",
    k: "the public key could not be parsed or is invalid",
    j: "private was invalid, try again",
    l: "tweak out of range or resulting public key is invalid",
    m: "tweak out of range",
    i: "the sum of the public keys is not valid",
    a: "scalar was invalid (zero or overflow)",
    c: "couldn't parse signature",
    d: "nonce generation function failed or private key is invalid",
    b: "couldn't recover public key from signature"
  }
}, function (e, r) {
  e.exports = require("assert")
}, function (e, r) {
  e.exports = {
    createHash: require('create-hash'),
    createHmac: require('create-hmac')
  }
}, function (e, r) {
  e.exports = require("bs58check")
}, function (e, r) {
  e.exports = require("elliptic")
}, function (e, r, t) {
  "use strict";
  t.r(r);
  var i = t(2),
    n = t(4),
    o = t(3),
    u = t(0),
    a = t.n(u),
    s = t(5),
    c = t(1),
    l = new s.ec("p256"),
    f = l.curve;

  function p(e) {
    return l.keyFromPublic(e)
  }
  t.d(r, "HDKey", function () {
    return y
  });
  const d = Buffer.from("Nist256p1 seed", "utf8"),
    h = 78,
    v = {
      private: 76066276,
      public: 76067358
    };
  class y {
    constructor(e) {
      this.versions = e || v, this.depth = 0, this.index = 0, this._privateKey = null, this._publicKey = null, this.chainCode = null, this._fingerprint = 0, this.parentFingerprint = 0
    }
    static fromMasterSeed(e, r) {
      var t = o.createHmac("sha512", d).update(e).digest(),
        i = t.slice(0, 32),
        n = t.slice(32),
        u = new y(r);
      return u.chainCode = n, u.privateKey = i, u
    }
    static fromExtendedKey(e, r) {
      var t = new y(r = r || v),
        o = n.decode(e),
        u = o.readUInt32BE(0);
      i.ok(u === r.private || u === r.public, "Version mismatch: does not match private or public"), t.depth = o.readUInt8(4), t.parentFingerprint = o.readUInt32BE(5), t.index = o.readUInt32BE(9), t.chainCode = o.slice(13, 45);
      var a = o.slice(45);
      return 0 === a.readUInt8(0) ? (i.ok(u === r.private, "Version mismatch: version does not match private"), t.privateKey = a.slice(1)) : (i.ok(u === r.public, "Version mismatch: version does not match public"), t.publicKey = a), t
    }
    static fromJSON(e) {
      return y.fromExtendedKey(e.xpriv)
    }
    get fingerprint() {
      return this._fingerprint
    }
    get identifier() {
      return this._identifier
    }
    get pubKeyHash() {
      return this.identifier
    }
    get privateKey() {
      return this._privateKey
    }
    set privateKey(e) {
      if (null === e) throw new Error("Can not directly set privateKey to null.");
      i.equal(e.length, 32, "Private key must be 32 bytes."), i.ok(!0 === function (e) {
        var r = new a.a(e);
        return r.cmp(f.n) < 0 && !r.isZero()
      }(e), "Invalid private key"), this._privateKey = e, this._publicKey = function (e, r) {
        var t = new a.a(e);
        if (t.cmp(f.n) >= 0 || t.isZero()) throw new Error(c.j);
        return Buffer.from(l.keyFromPrivate(e).getPublic(r, "true"))
      }(e, !0), this._identifier = g(this.publicKey), this._fingerprint = this._identifier.slice(0, 4).readUInt32BE(0)
    }
    get publicKey() {
      return this._publicKey
    }
    set publicKey(e) {
      if (null === e) throw new Error("Can not directly set privateKey to null.");
      i.ok(33 === e.length || 65 === e.length, "Public key must be 33 or 65 bytes."), i.ok(!0 === function (e) {
        return null !== p(e)
      }(e), "Invalid public key"), this._publicKey = function (e, r) {
        var t = p(e);
        if (null === t) throw new Error(c.k);
        return Buffer.from(t.getPublic(r, "true"))
      }(e, !0), this._identifier = g(this.publicKey), this._fingerprint = this._identifier.slice(0, 4).readUInt32BE(0), this._privateKey = null
    }
    get privateExtendedKey() {
      return this._privateKey ? n.encode(b(this, this.versions.private, Buffer.concat([Buffer.alloc(1, 0), this.privateKey]))) : null
    }
    get publicExtendedKey() {
      return n.encode(b(this, this.versions.public, this.publicKey))
    }
    derive(e) {
      if ("m" === e || "M" === e || "m'" === e || "M'" === e) return this;
      let r = this;
      return e.split("/").forEach(function (e, t) {
        if (0 === t) return void i.ok(/^[mM]{1}/.test(e), 'Path must start with "m" or "M"');
        const n = e.length > 1 && "'" === e[e.length - 1];
        let o = parseInt(e, 10);
        i.ok(o < y.HARDENED_OFFSET, "Invalid index"), n && (o += y.HARDENED_OFFSET), r = r.deriveChild(o)
      }), r
    }
    deriveChild(e) {
      const r = e >= y.HARDENED_OFFSET,
        t = Buffer.allocUnsafe(4);
      let n;
      if (t.writeUInt32BE(e, 0), r) {
        i.ok(this.privateKey, "Could not derive hardened child key");
        let e = this.privateKey;
        const r = Buffer.alloc(1, 0);
        e = Buffer.concat([r, e]), n = Buffer.concat([e, t])
      } else n = Buffer.concat([this.publicKey, t]);
      const u = o.createHmac("sha512", this.chainCode).update(n).digest(),
        s = u.slice(0, 32),
        l = u.slice(32),
        d = new y(this.versions);
      if (this.privateKey) try {
        d.privateKey = function (e, r) {
          var t = new a.a(r);
          if (t.cmp(f.n) >= 0) throw new Error(c.g);
          if (t.iadd(new a.a(e)), t.cmp(f.n) >= 0 && t.isub(f.n), t.isZero()) throw new Error(c.g);
          return t.toArrayLike(Buffer, "be", 32)
        }(this.privateKey, s)
      } catch (r) {
        return this.deriveChild(e + 1)
      } else try {
        d.publicKey = function (e, r, t) {
          var i = p(e);
          if (null === i) throw new Error(c.k);
          if ((r = new a.a(r)).cmp(f.n) >= 0) throw new Error(c.l);
          return Buffer.from(f.g.mul(r).add(i.getPublic()).encode(!0, t))
        }(this.publicKey, s, !0)
      } catch (r) {
        return this.deriveChild(e + 1)
      }
      return d.chainCode = l, d.depth = this.depth + 1, d.parentFingerprint = this.fingerprint, d.index = e, d
    }
    sign(e) {
      return function (e, r, t, i) {
        if ("function" == typeof t) {
          var n = t;
          t = function (t) {
            var o = n(e, r, null, i, t);
            if (!Buffer.isBuffer(o) || 32 !== o.length) throw new Error(c.d);
            return new a.a(o)
          }
        }
        var o = new a.a(r);
        if (o.cmp(f.n) >= 0 || o.isZero()) throw new Error(c.d);
        var u = l.sign(e, r, {
          canonical: !0,
          k: t,
          pers: i
        });
        return {
          signature: Buffer.concat([u.r.toArrayLike(Buffer, "be", 32), u.s.toArrayLike(Buffer, "be", 32)]),
          recovery: u.recoveryParam
        }
      }(e, this.privateKey).signature
    }
    verify(e, r) {
      return function (e, r, t) {
        if (e.length % 2 != 0) throw new Error("Wrong message length");
        var i = {
            r: r.slice(0, 32),
            s: r.slice(32, 64)
          },
          n = new a.a(i.r),
          o = new a.a(i.s);
        if (n.cmp(f.n) >= 0 || o.cmp(f.n) >= 0) throw new Error(c.c);
        if (1 === o.cmp(l.nh) || n.isZero() || o.isZero()) return !1;
        var u = p(t);
        if (null === u) throw new Error(c.k);
        return l.verify(e, i, {
          x: u.getPublic().x,
          y: u.getPublic().y
        })
      }(e, r, this.publicKey)
    }
    toJSON() {
      return {
        xpriv: this.privateExtendedKey,
        xpub: this.publicExtendedKey
      }
    }
  }

  function b(e, r, t) {
    var i = Buffer.allocUnsafe(h);
    i.writeUInt32BE(r, 0), i.writeUInt8(e.depth, 4);
    var n = e.depth ? e.parentFingerprint : 0;
    return i.writeUInt32BE(n, 5), i.writeUInt32BE(e.index, 9), e.chainCode.copy(i, 13), t.copy(i, 45), i
  }

  function g(e) {
    var r = o.createHash("sha256").update(e).digest();
    return o.createHash("rmd160").update(r).digest()
  }
  y.HARDENED_OFFSET = 2147483648
}]);