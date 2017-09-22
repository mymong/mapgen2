/*
 * From http://www.redblobgames.com/maps/mapgen2/
 * Copyright 2017 Red Blob Games <redblobgames@gmail.com>
 * License: Apache v2.0 <http://www.apache.org/licenses/LICENSE-2.0.html>
 */

'use strict';

const MIN_SPRING_ELEVATION = 0.3;
const MAX_SPRING_ELEVATION = 0.9;

/**
 * Find candidates for river sources
 *
 * Unlike the assign_* functions this does not write into an existing array
 */
export function find_spring_t(mesh, r_water, t_elevation, t_downslope_s) {
    const t_water = (t) =>
          (  r_water[mesh.s_begin_r(3*t)]
          || r_water[mesh.s_begin_r(3*t+1)]
          || r_water[mesh.s_begin_r(3*t+2)] );

    let spring_t = new Set();
    // Add everything above some elevation, but not lakes
    for (let t = 0; t < mesh.numSolidTriangles; t++) {
        if (t_elevation[t] >= MIN_SPRING_ELEVATION &&
            t_elevation[t] <= MAX_SPRING_ELEVATION &&
            !t_water(t)) {
            spring_t.add(t);
        }
    }
    return Array.from(spring_t);
};


export function assign_s_flow(s_flow, mesh, t_downslope_s, river_t) {
    // Each river in river_t contributes 1 flow down to the coastline
    s_flow.length = mesh.numSides;
    s_flow.fill(0);
    for (let t of river_t) {
        for (;;) {
            let s = t_downslope_s[t];
            if (s === -1) { break; }
            s_flow[s]++;
            let next_t = mesh.s_outer_t(s);
            if (next_t === t) { break; }
            t = next_t;
        }
    }
    return s_flow;
};
