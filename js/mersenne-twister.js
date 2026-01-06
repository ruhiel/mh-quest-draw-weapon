// クラスとして定義し、どこからでも使えるようにします
class MersenneTwister {
    constructor(seed = Date.now()) {
        this.mt = new Array(624);
        this.index = 0;
        this.mt[0] = seed >>> 0;
        for (let i = 1; i < 624; i++) {
            let s = this.mt[i - 1] ^ (this.mt[i - 1] >>> 30);
            this.mt[i] = (((((s & 0xffff0000) >>> 16) * 1812433253) << 16) + (s & 0x0000ffff) * 1812433253 + i) >>> 0;
        }
    }

    random() {
        if (this.index >= 624) {
            for (let i = 0; i < 624; i++) {
                let y = (this.mt[i] & 0x80000000) | (this.mt[(i + 1) % 624] & 0x7fffffff);
                this.mt[i] = this.mt[(i + 397) % 624] ^ (y >>> 1);
                if (y % 2 !== 0) this.mt[i] ^= 0x9908b0df;
            }
            this.index = 0;
        }
        let y = this.mt[this.index++];
        y ^= (y >>> 11);
        y ^= (y << 7) & 0x9d2c5680;
        y ^= (y << 15) & 0xefc60000;
        y ^= (y >>> 18);
        return (y >>> 0) * (1.0 / 4294967296.0);
    }
}

// グローバルにインスタンスを作成しておく
const mt = new MersenneTwister();