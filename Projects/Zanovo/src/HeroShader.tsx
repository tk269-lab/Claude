import { Shader, Swirl, ChromaFlow, FlutedGlass, FilmGrain } from 'shaders/react'
import { ORANGE } from './site'

/* Lives in its own module so the shader library and its three.js dependency
   (about three quarters of the old single bundle) download only for browsers
   that can run it. Home.tsx lazy-loads this behind the navigator.gpu check. */
export default function HeroShader() {
  return (
    <Shader style={{ width: '100%', height: '100%' }}>
      <Swirl colorA="#ffffff" colorB="#f0f0f0" detail={1.7} />
      <ChromaFlow baseColor="#ffffff" downColor={ORANGE} leftColor={ORANGE} rightColor={ORANGE} upColor={ORANGE} momentum={13} radius={3.5} />
      <FlutedGlass aberration={0.61} angle={31} frequency={8} highlight={0.12} highlightSoftness={0} lightAngle={-90} refraction={4} shape="rounded" softness={1} speed={0.15} />
      <FilmGrain strength={0.05} />
    </Shader>
  )
}
