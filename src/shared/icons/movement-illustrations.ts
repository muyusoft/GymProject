/**
 * Ilustraciones de los movimientos de calentamiento y estiramiento (ficha del movimiento). Igual que las de equipo:
 * 4:3, varios tonos, y sus colores son marcadores que .svgrrc cambia por `props.tones`.
 */

import type { FC } from "react";
import type { IllustrationProps } from "./equipment-illustrations";

import MovementJumpingJacks from "./movement-jumping-jacks.svg";
import MovementWalkingKneeHug from "./movement-walking-knee-hug.svg";
import MovementArmCircles from "./movement-arm-circles.svg";
import MovementCatCamel from "./movement-cat-camel.svg";
import MovementBodyweightSquat from "./movement-bodyweight-squat.svg";
import MovementLungeTwist from "./movement-lunge-twist.svg";
import MovementLegSwingFront from "./movement-leg-swing-front.svg";
import MovementLegSwingSide from "./movement-leg-swing-side.svg";
import MovementGluteBridge from "./movement-glute-bridge.svg";
import MovementHipHinge from "./movement-hip-hinge.svg";
import MovementAnkleRock from "./movement-ankle-rock.svg";
import MovementBandLateralWalk from "./movement-band-lateral-walk.svg";
import MovementBandMonsterWalk from "./movement-band-monster-walk.svg";
import MovementBandGluteBridge from "./movement-band-glute-bridge.svg";
import MovementThoracicRotation from "./movement-thoracic-rotation.svg";
import MovementScapularPushUp from "./movement-scapular-push-up.svg";
import MovementWallSlide from "./movement-wall-slide.svg";
import MovementBandPullApart from "./movement-band-pull-apart.svg";
import MovementBandDislocate from "./movement-band-dislocate.svg";
import MovementBandExternalRotation from "./movement-band-external-rotation.svg";
import MovementStandingQuad from "./movement-standing-quad.svg";
import MovementSeatedHamstring from "./movement-seated-hamstring.svg";
import MovementKneelingHipFlexor from "./movement-kneeling-hip-flexor.svg";
import MovementFigureFour from "./movement-figure-four.svg";
import MovementButterfly from "./movement-butterfly.svg";
import MovementWallCalf from "./movement-wall-calf.svg";
import MovementDoorwayChest from "./movement-doorway-chest.svg";
import MovementWallLat from "./movement-wall-lat.svg";
import MovementCrossBodyShoulder from "./movement-cross-body-shoulder.svg";
import MovementOverheadTriceps from "./movement-overhead-triceps.svg";
import MovementChildPose from "./movement-child-pose.svg";
import MovementGentleCobra from "./movement-gentle-cobra.svg";

export const MOVEMENT_ILLUSTRATION_NAMES = [
  "jumpingJacks",
  "walkingKneeHug",
  "armCircles",
  "catCamel",
  "bodyweightSquat",
  "lungeTwist",
  "legSwingFront",
  "legSwingSide",
  "gluteBridge",
  "hipHinge",
  "ankleRock",
  "bandLateralWalk",
  "bandMonsterWalk",
  "bandGluteBridge",
  "thoracicRotation",
  "scapularPushUp",
  "wallSlide",
  "bandPullApart",
  "bandDislocate",
  "bandExternalRotation",
  "standingQuad",
  "seatedHamstring",
  "kneelingHipFlexor",
  "figureFour",
  "butterfly",
  "wallCalf",
  "doorwayChest",
  "wallLat",
  "crossBodyShoulder",
  "overheadTriceps",
  "childPose",
  "gentleCobra",
] as const;
export type MovementIllustrationName = (typeof MOVEMENT_ILLUSTRATION_NAMES)[number];

export const MOVEMENT_ILLUSTRATIONS: Record<MovementIllustrationName, FC<IllustrationProps>> = {
  jumpingJacks: MovementJumpingJacks,
  walkingKneeHug: MovementWalkingKneeHug,
  armCircles: MovementArmCircles,
  catCamel: MovementCatCamel,
  bodyweightSquat: MovementBodyweightSquat,
  lungeTwist: MovementLungeTwist,
  legSwingFront: MovementLegSwingFront,
  legSwingSide: MovementLegSwingSide,
  gluteBridge: MovementGluteBridge,
  hipHinge: MovementHipHinge,
  ankleRock: MovementAnkleRock,
  bandLateralWalk: MovementBandLateralWalk,
  bandMonsterWalk: MovementBandMonsterWalk,
  bandGluteBridge: MovementBandGluteBridge,
  thoracicRotation: MovementThoracicRotation,
  scapularPushUp: MovementScapularPushUp,
  wallSlide: MovementWallSlide,
  bandPullApart: MovementBandPullApart,
  bandDislocate: MovementBandDislocate,
  bandExternalRotation: MovementBandExternalRotation,
  standingQuad: MovementStandingQuad,
  seatedHamstring: MovementSeatedHamstring,
  kneelingHipFlexor: MovementKneelingHipFlexor,
  figureFour: MovementFigureFour,
  butterfly: MovementButterfly,
  wallCalf: MovementWallCalf,
  doorwayChest: MovementDoorwayChest,
  wallLat: MovementWallLat,
  crossBodyShoulder: MovementCrossBodyShoulder,
  overheadTriceps: MovementOverheadTriceps,
  childPose: MovementChildPose,
  gentleCobra: MovementGentleCobra,
};
