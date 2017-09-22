/*
 * From http://www.redblobgames.com/maps/mapgen2/
 * Copyright 2017 Red Blob Games <redblobgames@gmail.com>
 * License: Apache v2.0 <http://www.apache.org/licenses/LICENSE-2.0.html>
 */

'use strict';

/**
 * Find regions adjacent to rivers; out_r should be a Set
 */
export function find_riverbanks_r(out_r, mesh, s_flow) {
    for (let s = 0; s < mesh.numSolidSides; s++) {
        if (s_flow[s] > 0) {
            out_r.add(mesh.s_begin_r(s));
            out_r.add(mesh.s_end_r(s));
        }
    }
};


/**
 * Find lakeshores -- regions adjacent to lakes; out_r should be a Set
 */
export function find_lakeshores_r(out_r, mesh, r_ocean, r_water) {
    for (let s = 0; s < mesh.numSolidSides; s++) {
        let r0 = mesh.s_begin_r(s),
            r1 = mesh.s_end_r(s);
        if (r_water[r0] && !r_ocean[r0]) {
            out_r.add(r0);
            out_r.add(r1);
        }
    }
};


/**
 * Find regions that have maximum moisture; returns a Set
 */
export function find_moisture_seeds_r(mesh, s_flow, r_ocean, r_water) {
    let seeds_r = new Set();
    find_riverbanks_r(seeds_r, mesh, s_flow);
    find_lakeshores_r(seeds_r, mesh, r_ocean, r_water);
    return seeds_r;
};


/**
 * Assign moisture level. Oceans and lakes have moisture 1.0. Land
 * regions have moisture based on the distance to the nearest fresh
 * water. Lakeshores and riverbanks are distance 0. Moisture will be
 * 1.0 at distance 0 and go down to 0.0 at the maximum distance.
 */
export function assign_r_moisture(
    r_moisture, r_waterdistance,
    mesh,
    r_water, seed_r /* Set */
) {
    r_waterdistance.length = mesh.numRegions;
    r_moisture.length = mesh.numRegions;
    r_waterdistance.fill(null);

    let out_r = [];
    let queue_r = Array.from(seed_r);
    let maxDistance = 1;
    queue_r.forEach((r) => { r_waterdistance[r] = 0; });
    while (queue_r.length > 0) {
        let current_r = queue_r.shift();
        mesh.r_circulate_r(out_r, current_r);
        for (let neighbor_r of out_r) {
            if (!r_water[neighbor_r] && r_waterdistance[neighbor_r] === null) {
                let newDistance = 1 + r_waterdistance[current_r];
                r_waterdistance[neighbor_r] = newDistance;
                if (newDistance > maxDistance) { maxDistance = newDistance; }
                queue_r.push(neighbor_r);
            }
        }
    }

    r_waterdistance.forEach((d, r) => {
        r_moisture[r] = r_water[r]? 1.0 : 1.0 - Math.pow(d / maxDistance, 0.5);
    });
};


/**
 * Redistribute moisture values evenly so that all moistures
 * from 0 to 1 are equally represented.
 */
export function redistribute_r_moisture(r_moisture, mesh, r_water) {
    let land_r = [];
    for (let r = 0; r < mesh.numSolidRegions; r++) {
        if (!r_water[r]) {
            land_r.push(r);
        }
    }

    land_r.sort((r1, r2) => r_moisture[r1] - r_moisture[r2]);

    for (let i = 0; i < land_r.length; i++) {
        r_moisture[land_r[i]] = i / (land_r.length - 1);
    }
};
