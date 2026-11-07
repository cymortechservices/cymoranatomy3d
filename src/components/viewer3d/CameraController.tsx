import { useEffect, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import type { AtlasView, CameraCommand, ViewName } from './types'

const VIEW_DIR: Record<ViewName, [number, number, number]> = {
  anterior: [0, 0, 1],
  posterior: [0, 0, -1],
  left: [1, 0, 0], // patient's left is +x in this coordinate system (patient faces +z)
  right: [-1, 0, 0],
  superior: [0, 1, 0.0001],
  inferior: [0, -1, 0.0001],
}

interface Props {
  model: AtlasView
  command: CameraCommand | null
  durationS: number
}

interface OrbitLike {
  target: THREE.Vector3
  update: () => void
  minDistance: number
  maxDistance: number
}

/**
 * Animates the camera between views. All camera commands (named views, reset, fit, focus on a part, step rotate,
 * zoom) are queued through `command`; each distinct `command.id` starts one eased transition of camera position and
 * orbit target. With reduced motion the duration is 0, so the camera jumps.
 */
export function CameraController({ model, command, durationS }: Props) {
  const camera = useThree((s) => s.camera)
  const controls = useThree((s) => s.controls) as unknown as OrbitLike | null
  const invalidate = useThree((s) => s.invalidate)
  const anim = useRef<{ t: number; fromPos: THREE.Vector3; toPos: THREE.Vector3; fromTarget: THREE.Vector3; toTarget: THREE.Vector3 } | null>(null)
  const last = useRef<number>(-1)

  const home = () => ({
    target: new THREE.Vector3(...model.camera.target),
    distance: model.camera.distance,
  })

  // Place the camera at the default pose whenever the model changes.
  useEffect(() => {
    if (!controls) return
    const { target, distance } = home()
    camera.position.copy(target).add(new THREE.Vector3(0, 0.1, 1).normalize().multiplyScalar(distance))
    controls.target.copy(target)
    controls.minDistance = distance * 0.12
    controls.maxDistance = distance * 3
    controls.update()
    invalidate()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [model.id, controls])

  useEffect(() => {
    if (!command || !controls || command.id === last.current) return
    last.current = command.id
    const { target: homeTarget, distance: homeDist } = home()
    const fromPos = camera.position.clone()
    const fromTarget = controls.target.clone()
    let toPos = fromPos.clone()
    let toTarget = fromTarget.clone()

    switch (command.type) {
      case 'view': {
        toTarget = homeTarget.clone()
        toPos = homeTarget.clone().add(new THREE.Vector3(...VIEW_DIR[command.view]).normalize().multiplyScalar(homeDist))
        break
      }
      case 'reset':
      case 'fit': {
        toTarget = homeTarget.clone()
        toPos = homeTarget.clone().add(new THREE.Vector3(0, 0.1, 1).normalize().multiplyScalar(command.type === 'fit' ? homeDist * 0.95 : homeDist))
        break
      }
      case 'focus': {
        toTarget = new THREE.Vector3(...command.position)
        const dir = fromPos.clone().sub(fromTarget).normalize()
        toPos = toTarget.clone().add(dir.multiplyScalar(command.distance ?? homeDist * 0.55))
        break
      }
      case 'orbit': {
        const sph = new THREE.Spherical().setFromVector3(fromPos.clone().sub(fromTarget))
        sph.theta += command.dAzimuth
        sph.phi = THREE.MathUtils.clamp(sph.phi + command.dPolar, 0.05, Math.PI - 0.05)
        toPos = fromTarget.clone().add(new THREE.Vector3().setFromSpherical(sph))
        break
      }
      case 'zoom': {
        const offset = fromPos.clone().sub(fromTarget)
        const len = THREE.MathUtils.clamp(offset.length() * command.factor, controls.minDistance, controls.maxDistance)
        toPos = fromTarget.clone().add(offset.setLength(len))
        break
      }
    }
    anim.current = { t: durationS <= 0 ? 1 : 0, fromPos, toPos, fromTarget, toTarget }
    invalidate()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [command])

  useFrame((_, delta) => {
    const a = anim.current
    if (!a || !controls) return
    a.t = durationS <= 0 ? 1 : Math.min(1, a.t + delta / durationS)
    const k = a.t < 0.5 ? 2 * a.t * a.t : 1 - Math.pow(-2 * a.t + 2, 2) / 2 // ease in-out quad
    camera.position.lerpVectors(a.fromPos, a.toPos, k)
    controls.target.lerpVectors(a.fromTarget, a.toTarget, k)
    controls.update()
    if (a.t >= 1) anim.current = null
    invalidate()
  })

  return null
}
