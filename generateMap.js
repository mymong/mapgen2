/*
 * From http://www.redblobgames.com/maps/mapgen2/
 * Copyright 2017 Red Blob Games <redblobgames@gmail.com>
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *      http://www.apache.org/licenses/LICENSE-2.0
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import {
	randomShuffle
} from "./util.js";

import {
	assign_r_water,
	assign_r_ocean
} from "./Water.js";

import {
	assign_t_elevation,
	redistribute_t_elevation,
	assign_r_elevation
} from "./elevation.js";

import {
	find_spring_t,
	assign_s_flow
} from "./rivers.js";

import {
	assign_r_moisture,
	find_moisture_seeds_r,
	redistribute_r_moisture
} from "./moisture.js";

import {
	assign_r_coast,
	assign_r_biome
} from "./biomes.js";
import {
	assign_s_segments
} from "./noisy-edges.js";

/**
 * Map generator
 *
 * Map coordinates are 0 ≤ x ≤ 1000, 0 ≤ y ≤ 1000.
 *
 * mesh: DualMesh
 * noisyEdgeOptions: {length, amplitude, seed}
 * makeRandInt: function(seed) -> function(N) -> an int from 0 to N-1
 */

export function generateMap ({
	noise,
	mesh,
	noisyEdgeOptions,
	makeRandInt,
	shape = { round: 0.5, inflate: 0.4 },
	numRivers = 30,
	drainageSeed = 0,
	riverSeed = 0,
	noisyEdge = { length: 10, amplitude: 0.2, seed: 0 },
	biomeBias = { temperature: 0, moisture: 0 }
} = {})
{
	const s_lines = assign_s_segments(
		[],
		mesh,
		noisyEdgeOptions,
		makeRandInt(noisyEdgeOptions.seed)
	);

	const r_water = assign_r_water(mesh, noise, shape);
	const r_ocean = assign_r_ocean(mesh, r_water);
	const t_coastdistance = [];
	const t_elevation = [];
	const t_downslope_s = [];
	const r_elevation = [];
	const s_flow = [];
	const r_waterdistance = [];
	const r_moisture = [];
	const r_coast = [];
	const r_biome = [];


	assign_t_elevation(
		t_elevation,
		t_coastdistance,
		t_downslope_s,
		mesh,
		r_ocean,
		r_water,
		makeRandInt(drainageSeed)
	);

	redistribute_t_elevation(t_elevation, mesh);
	assign_r_elevation(r_elevation, mesh, t_elevation, r_ocean);

	const spring_t = find_spring_t(mesh, r_water, t_elevation, t_downslope_s);
	randomShuffle(spring_t, makeRandInt(riverSeed));

	const river_t = spring_t.slice(0, numRivers);
	assign_s_flow(s_flow, mesh, t_downslope_s, river_t, t_elevation);

	const moisture_seeds = find_moisture_seeds_r(
		mesh,
		s_flow,
		r_ocean,
		r_water
	);

	assign_r_moisture(
		r_moisture,
		r_waterdistance,
		mesh,
		r_water,
		moisture_seeds
	);
	redistribute_r_moisture(r_moisture, mesh, r_water);

	assign_r_coast(r_coast, mesh, r_ocean);
	assign_r_biome(
			r_biome,
			mesh,
			r_ocean,
			r_water,
			r_coast,
			r_elevation,
			r_moisture,
			biomeBias
	);

	return {
		r_biome,
		r_elevation,
		mesh
	}
}



