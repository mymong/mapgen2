// From http://www.redblobgames.com/maps/dual-mesh/
// Copyright 2017 Red Blob Games <redblobgames@gmail.com>
// License: Apache v2.0 <http://www.apache.org/licenses/LICENSE-2.0.html>

/**
 * Represent a triangle-polygon dual mesh with:
 *   - Regions (r)
 *   - Sides (s)
 *   - Triangles (t)
 *
 * Each element has an id:
 *   - 0 <= r < numRegions
 *   - 0 <= s < numSides
 *   - 0 <= t < numTriangles
 *
 * Naming convention: x_name_y takes x (r, s, t) as input and produces
 * y (r, s, t) as output. If the output isn't a mesh index (r, s, t)
 * then the _y suffix is omitted.
 *
 * A side is directed. If two triangles t0, t1 are adjacent, there will
 * be two sides representing the boundary, one for t0 and one for t1. These
 * can be accessed with s_inner_t and s_outer_t.
 *
 * A side also represents the boundary between two regions. If two regions
 * r0, r1 are adjacent, there will be two sides representing the boundary,
 * s_begin_r and s_end_r.
 *
 * Each side will have a pair, accessed with s_opposite_s.
 *
 * The mesh has no boundaries; it wraps around the "back" using a
 * "ghost" region. Some regions are marked as the boundary; these are
 * connected to the ghost region. Ghost triangles and ghost sides
 * connect these boundary regions to the ghost region. Elements that
 * aren't "ghost" are called "solid".
 */
export class TriangleMesh {
    static s_to_t(s)   { return (s/3) | 0; }
    static s_prev_s(s) { return (s % 3 == 0) ? s+2 : s-1; }
    static s_next_s(s) { return (s % 3 == 2) ? s-2 : s+1; }

    /**
     * constructor takes partial mesh information and fills in the rest; the
     * partial information is generated in create.js or in deserialize.js
     */
    constructor ({numBoundaryRegions, numSolidSides, r_vertex, _s_start_r, _s_opposite_s}) {
        Object.assign(this, {numBoundaryRegions, numSolidSides, r_vertex, _s_start_r, _s_opposite_s});

        this.numSides = this._s_start_r.length;
        this.numRegions = this.r_vertex.length;
        this.numSolidRegions = this.numRegions - 1;
        this.numTriangles = this.numSides / 3;
        this.numSolidTriangles = this.numSolidSides / 3;

        // Construct an index for finding sides connected to a region
        this._r_any_s = new Int32Array(this.numRegions);
        for (let s = 0; s < this._s_start_r.length; s++) {
            this._r_any_s[this._s_start_r[s]] = this._r_any_s[this._s_start_r[s]] || s;
        }

        // Construct triangle coordinates
        this.t_vertex = new Array(this.numTriangles);
        for (let s = 0; s < this._s_start_r.length; s += 3) {
            let a = this.r_vertex[this._s_start_r[s]],
                b = this.r_vertex[this._s_start_r[s+1]],
                c = this.r_vertex[this._s_start_r[s+2]];
            if (this.s_ghost(s)) {
                // ghost triangle center is just outside the unpaired side
                let dx = b[0]-a[0], dy = b[1]-a[1];
                this.t_vertex[s/3] = [a[0] + 0.5*(dx+dy), a[1] + 0.5*(dy-dx)];
            } else {
                // solid triangle center is at the centroid
                this.t_vertex[s/3] = [(a[0] + b[0] + c[0])/3,
                                     (a[1] + b[1] + c[1])/3];
            }
        }
    }

    s_begin_r(s)  { return this._s_start_r[s]; }
    s_end_r(s)    { return this._s_start_r[TriangleMesh.s_next_s(s)]; }

    s_inner_t(s)  { return TriangleMesh.s_to_t(s); }
    s_outer_t(s)  { return TriangleMesh.s_to_t(this._s_opposite_s[s]); }

    s_opposite_s(s) { return this._s_opposite_s[s]; }

    t_circulate_s(out_s, t) { out_s.length = 3; for (let i = 0; i < 3; i++) { out_s[i] = 3*t + i; } return out_s; }
    t_circulate_r(out_r, t) { out_r.length = 3; for (let i = 0; i < 3; i++) { out_r[i] = this._s_start_r[3*t+i]; } return out_r; }
    t_circulate_t(out_t, t) { out_t.length = 3; for (let i = 0; i < 3; i++) { out_t[i] = this.s_outer_t(3*t+i); } return out_t; }

    r_circulate_s(out_s, r) {
        const s0 = this._r_any_s[r];
        let s = s0;
        out_s.length = 0;
        do {
            out_s.push(s);
            s = TriangleMesh.s_next_s(this._s_opposite_s[s]);
        } while (s != s0);
        return out_s;
    }

    r_circulate_r(out_r, r) {
        const s0 = this._r_any_s[r];
        let s = s0;
        out_r.length = 0;
        do {
            out_r.push(this.s_end_r(s));
            s = TriangleMesh.s_next_s(this._s_opposite_s[s]);
        } while (s != s0);
        return out_r;
    }

    r_circulate_t(out_t, r) {
        const s0 = this._r_any_s[r];
        let s = s0;
        out_t.length = 0;
        do {
            out_t.push(TriangleMesh.s_to_t(s));
            s = TriangleMesh.s_next_s(this._s_opposite_s[s]);
        } while (s != s0);
        return out_t;
    }

    ghost_r()     { return this.numRegions - 1; }
    s_ghost(s)    { return s >= this.numSolidSides; }
    r_ghost(r)    { return r == this.numRegions - 1; }
    t_ghost(t)    { return this.s_ghost(3 * t); }
    s_boundary(s) { return this.s_ghost(s) && (s % 3 == 0); }
    r_boundary(r) { return r < this.numBoundaryRegions; }
}