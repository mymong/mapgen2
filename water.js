// From http://www.redblobgames.com/maps/mapgen2/
// Copyright 2017 Red Blob Games <redblobgames@gmail.com>
// License: Apache v2.0 <http://www.apache.org/licenses/LICENSE-2.0.html>

'use strict';

import { mix, fbm_noise } from './util.js'

// NOTE: r_water, r_ocean, other fields are boolean valued so it
// could be more efficient to pack them as bit fields in Uint8Array

/* a region is water if the noise value is low */
export function assign_r_water(mesh, noise, { round, inflate })
{
	const length = mesh.numRegions;
	const water = Array(length);
  for (let r = 0; r < length; r++)
	{
    if (mesh.r_ghost(r) || mesh.r_boundary(r))
		{
      water[r] = true;
    }
		else
		{
      const nx = (mesh.r_vertex[r][0] - 500) / 500;
      const ny = (mesh.r_vertex[r][1] - 500) / 500;
      const distance = Math.max(Math.abs(nx), Math.abs(ny));
      const n = mix(fbm_noise(noise, nx, ny), 0.5, round);
      water[r] = n - (1.0 - inflate) * distance * distance < 0;
    }
  }
  return water;
}


/* a region is ocean if it is a water region connected to the ghost region,
   which is outside the boundary of the map; this could be any seed set but
   for islands, the ghost region is a good seed */
export function assign_r_ocean(mesh, water)
{
	const length = mesh.numRegions;
	const ocean = Array(length);
  ocean.fill(false);
  let stack = [mesh.ghost_r()];
  let out = [];
	let r1;
  while (r1 = stack.pop())
	{
    mesh.r_circulate_r(out, r1);
    for (let r2 of out)
		{
      if (water[r2] && !ocean[r2])
			{
        ocean[r2] = true;
        stack.push(r2);
      }
    }
  }
  return ocean;
}
