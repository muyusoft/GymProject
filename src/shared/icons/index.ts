/**
 * Iconos de Overload (56). Dibujados en una grilla de 24, trazo 2, extremos redondeados.
 * Usan stroke="currentColor": el color llega por la prop `color` de IconRenderer.
 * Excepción: brand-apple y brand-google son los logotipos oficiales (relleno, y Google con sus cuatro colores).
 * Para agregar uno: crea el .svg con el mismo encabezado y regístralo en los tres lugares de este archivo.
 */

import type { FC } from "react";
import type { SvgProps } from "react-native-svg";

import ArrowDownIcon from "./arrow-down.svg";
import ArrowLeftIcon from "./arrow-left.svg";
import ArrowRightLeftIcon from "./arrow-right-left.svg";
import ArrowUpIcon from "./arrow-up.svg";
import BarChartIcon from "./bar-chart.svg";
import BellIcon from "./bell.svg";
import BodyIcon from "./body.svg";
import BrandAppleIcon from "./brand-apple.svg";
import BrandGoogleIcon from "./brand-google.svg";
import CalendarIcon from "./calendar.svg";
import CheckIcon from "./check.svg";
import ChevronDownIcon from "./chevron-down.svg";
import ChevronLeftIcon from "./chevron-left.svg";
import ChevronRightIcon from "./chevron-right.svg";
import ChevronUpIcon from "./chevron-up.svg";
import CircleCheckIcon from "./circle-check.svg";
import ClipboardIcon from "./clipboard.svg";
import ClockIcon from "./clock.svg";
import CopyIcon from "./copy.svg";
import DownloadIcon from "./download.svg";
import DumbbellIcon from "./dumbbell.svg";
import EllipsisIcon from "./ellipsis.svg";
import EllipsisVerticalIcon from "./ellipsis-vertical.svg";
import ExternalLinkIcon from "./external-link.svg";
import EyeIcon from "./eye.svg";
import EyeOffIcon from "./eye-off.svg";
import FilterIcon from "./filter.svg";
import FlameIcon from "./flame.svg";
import GlobeIcon from "./globe.svg";
import GripVerticalIcon from "./grip-vertical.svg";
import HistoryIcon from "./history.svg";
import InfoIcon from "./info.svg";
import KettlebellIcon from "./kettlebell.svg";
import LightbulbIcon from "./lightbulb.svg";
import MailIcon from "./mail.svg";
import MinusIcon from "./minus.svg";
import MoonIcon from "./moon.svg";
import PauseIcon from "./pause.svg";
import PencilIcon from "./pencil.svg";
import PlayIcon from "./play.svg";
import PlusIcon from "./plus.svg";
import RepeatIcon from "./repeat.svg";
import ScaleIcon from "./scale.svg";
import SearchIcon from "./search.svg";
import SkipForwardIcon from "./skip-forward.svg";
import SlidersIcon from "./sliders.svg";
import SunIcon from "./sun.svg";
import TimerIcon from "./timer.svg";
import TrashIcon from "./trash.svg";
import TrendingDownIcon from "./trending-down.svg";
import TrendingUpIcon from "./trending-up.svg";
import TriangleAlertIcon from "./triangle-alert.svg";
import TrophyIcon from "./trophy.svg";
import UploadIcon from "./upload.svg";
import UserIcon from "./user.svg";
import XIcon from "./x.svg";

export {
  ArrowDownIcon,
  ArrowLeftIcon,
  ArrowRightLeftIcon,
  ArrowUpIcon,
  BarChartIcon,
  BellIcon,
  BodyIcon,
  BrandAppleIcon,
  BrandGoogleIcon,
  CalendarIcon,
  CheckIcon,
  ChevronDownIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ChevronUpIcon,
  CircleCheckIcon,
  ClipboardIcon,
  ClockIcon,
  CopyIcon,
  DownloadIcon,
  DumbbellIcon,
  EllipsisIcon,
  EllipsisVerticalIcon,
  ExternalLinkIcon,
  EyeIcon,
  EyeOffIcon,
  FilterIcon,
  FlameIcon,
  GlobeIcon,
  GripVerticalIcon,
  HistoryIcon,
  InfoIcon,
  KettlebellIcon,
  LightbulbIcon,
  MailIcon,
  MinusIcon,
  MoonIcon,
  PauseIcon,
  PencilIcon,
  PlayIcon,
  PlusIcon,
  RepeatIcon,
  ScaleIcon,
  SearchIcon,
  SkipForwardIcon,
  SlidersIcon,
  SunIcon,
  TimerIcon,
  TrashIcon,
  TrendingDownIcon,
  TrendingUpIcon,
  TriangleAlertIcon,
  TrophyIcon,
  UploadIcon,
  UserIcon,
  XIcon,
};

export const AVAILABLE_ICONS = [
  "arrow-down",
  "arrow-left",
  "arrow-right-left",
  "arrow-up",
  "bar-chart",
  "bell",
  "body",
  "brand-apple",
  "brand-google",
  "calendar",
  "check",
  "chevron-down",
  "chevron-left",
  "chevron-right",
  "chevron-up",
  "circle-check",
  "clipboard",
  "clock",
  "copy",
  "download",
  "dumbbell",
  "ellipsis",
  "ellipsis-vertical",
  "external-link",
  "eye",
  "eye-off",
  "filter",
  "flame",
  "globe",
  "grip-vertical",
  "history",
  "info",
  "kettlebell",
  "lightbulb",
  "mail",
  "minus",
  "moon",
  "pause",
  "pencil",
  "play",
  "plus",
  "repeat",
  "scale",
  "search",
  "skip-forward",
  "sliders",
  "sun",
  "timer",
  "trash",
  "trending-down",
  "trending-up",
  "triangle-alert",
  "trophy",
  "upload",
  "user",
  "x",
] as const;

export type IconName = (typeof AVAILABLE_ICONS)[number];

export const ICON_REGISTRY: Record<IconName, FC<SvgProps>> = {
  "arrow-down": ArrowDownIcon,
  "arrow-left": ArrowLeftIcon,
  "arrow-right-left": ArrowRightLeftIcon,
  "arrow-up": ArrowUpIcon,
  "bar-chart": BarChartIcon,
  bell: BellIcon,
  body: BodyIcon,
  "brand-apple": BrandAppleIcon,
  "brand-google": BrandGoogleIcon,
  calendar: CalendarIcon,
  check: CheckIcon,
  "chevron-down": ChevronDownIcon,
  "chevron-left": ChevronLeftIcon,
  "chevron-right": ChevronRightIcon,
  "chevron-up": ChevronUpIcon,
  "circle-check": CircleCheckIcon,
  clipboard: ClipboardIcon,
  clock: ClockIcon,
  copy: CopyIcon,
  download: DownloadIcon,
  dumbbell: DumbbellIcon,
  ellipsis: EllipsisIcon,
  "ellipsis-vertical": EllipsisVerticalIcon,
  "external-link": ExternalLinkIcon,
  eye: EyeIcon,
  "eye-off": EyeOffIcon,
  filter: FilterIcon,
  flame: FlameIcon,
  globe: GlobeIcon,
  "grip-vertical": GripVerticalIcon,
  history: HistoryIcon,
  info: InfoIcon,
  kettlebell: KettlebellIcon,
  lightbulb: LightbulbIcon,
  mail: MailIcon,
  minus: MinusIcon,
  moon: MoonIcon,
  pause: PauseIcon,
  pencil: PencilIcon,
  play: PlayIcon,
  plus: PlusIcon,
  repeat: RepeatIcon,
  scale: ScaleIcon,
  search: SearchIcon,
  "skip-forward": SkipForwardIcon,
  sliders: SlidersIcon,
  sun: SunIcon,
  timer: TimerIcon,
  trash: TrashIcon,
  "trending-down": TrendingDownIcon,
  "trending-up": TrendingUpIcon,
  "triangle-alert": TriangleAlertIcon,
  trophy: TrophyIcon,
  upload: UploadIcon,
  user: UserIcon,
  x: XIcon,
};
