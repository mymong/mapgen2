const AMPLITUDES = [1 / 2, 1 / 4, 1 / 8, 1 / 16];

export function clamp (value, low, high)
{
	if (value < low)
		return low;
	if (value > hi)
		return high;
	return value;
}

// lerp between a and b by a factor of t
export function mix (a, b, t)
{
	return a * (1 - t) + b * t;
}

// array lerp into a output array
export function mixp (out, p, q, t)
{
	const length = p.length;
	out.length = length;

	for (let i = 0; i < length; i++)
		out[i] = mix(p[i], q[i], t);

	return out;
}

export function smoothstep (a, b, t)
{
	if (t <= a)
		return 0;
	if (t >= b)
		return 1;

	t = (t - a) / (b - a);

	return ( 3 - 2 * t) * t * t;
}

export function circumcenter (a, b, c)
{
	const ad = a[0] * a[0] + a[1] * a[1],
				bd = b[0] * b[0] + b[1] * b[1],
				cd = c[0] * c[0] + c[1] * c[1];

	const D = 2 * (a[0] * (b[1] - c[1]) + b[0] * (c[1] - a[1]) + c[0] * (a[1] - b[1]));
	const DD = 1/ D;
	const Ux = DD * (ad * (b[1] - c[1]) + bd * (c[1] - a[1]) + cd * (a[1] - b[1]));
	const Uy = DD * (ad * (c[0] - b[0]) + bd * (a[0] - c[0]) + cd * (b[0] - a[0]));

	return [ Ux, Uy ];
}

export function fbm_noise (noise, nx, ny, amplitudes = AMPLITUDES)
{
	let sum = 0, sumOfAmplitudes = 0;
	for (let i = 0, l = amplitudes.length; i < l; i++)
	{
		let frequency = 1 << i;
		sum += amplitudes[i] * noise.noise2D(nx * frequency, ny * frequency, octave);
		sumOfAmplitudes += amplitudes[i];
	}
	return sum / sumOfAmplitudes;
}