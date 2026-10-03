/**
 * Icon components library (49 icons)
 * Los SVGs usan stroke="currentColor" para respetar colores dinámicos
 */

import type { FC } from "react";
import type { SvgProps } from "react-native-svg";

import ActivityIcon from "./activity.svg";
import ArrowLeftIcon from "./arrow-left.svg";
import CameraIcon from "./camera.svg";
import CalendarIcon from "./calendar.svg";
import CheckIcon from "./check.svg";
import ChevronDownIcon from "./chevron-down.svg";
import ChevronLeftIcon from "./chevron-left.svg";
import ChevronRightIcon from "./chevron-right.svg";
import ChevronUpIcon from "./chevron-up.svg";
import CircleXIcon from "./circle-x.svg";
import ClockIcon from "./clock.svg";
import CopyIcon from "./copy.svg";
import DownloadIcon from "./download.svg";
import EllipsisIcon from "./ellipsis.svg";
import EllipsisVerticalIcon from "./ellipsis-vertical.svg";
import EyeIcon from "./eye.svg";
import FileIcon from "./file.svg";
import FileTextIcon from "./file-text.svg";
import GlobeIcon from "./globe.svg";
import HeartIcon from "./heart.svg";
import InfoIcon from "./info.svg";
import LayoutGridIcon from "./layout-grid.svg";
import LightbulbIcon from "./lightbulb.svg";
import LogOutIcon from "./log-out.svg";
import MailIcon from "./mail.svg";
import MapPinIcon from "./map-pin.svg";
import MenuIcon from "./menu.svg";
import PencilIcon from "./pencil.svg";
import PhoneIcon from "./phone.svg";
import PlayIcon from "./play.svg";
import PlusIcon from "./plus.svg";
import RefreshCcwIcon from "./refresh-ccw.svg";
import SaveIcon from "./save.svg";
import SearchIcon from "./search.svg";
import SendIcon from "./send.svg";
import SettingsIcon from "./settings.svg";
import ShieldIcon from "./shield.svg";
import ShieldCheckIcon from "./shield-check.svg";
import SlidersHorizontalIcon from "./sliders-horizontal.svg";
import SparklesIcon from "./sparkles.svg";
import SquareArrowOutUpRightIcon from "./square-arrow-out-up-right.svg";
import SquarePenIcon from "./square-pen.svg";
import StarIcon from "./star.svg";
import TrashIcon from "./trash.svg";
import TriangleAlertIcon from "./triangle-alert.svg";
import UploadIcon from "./upload.svg";
import UserIcon from "./user.svg";
import UsersIcon from "./users.svg";
import UsersRoundIcon from "./users-round.svg";
import XIcon from "./x.svg";

export {
  ActivityIcon,
  ArrowLeftIcon,
  CameraIcon,
  CalendarIcon,
  CheckIcon,
  ChevronDownIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ChevronUpIcon,
  CircleXIcon,
  ClockIcon,
  CopyIcon,
  DownloadIcon,
  EllipsisIcon,
  EllipsisVerticalIcon,
  EyeIcon,
  FileIcon,
  FileTextIcon,
  GlobeIcon,
  HeartIcon,
  InfoIcon,
  LayoutGridIcon,
  LightbulbIcon,
  LogOutIcon,
  MailIcon,
  MapPinIcon,
  MenuIcon,
  PencilIcon,
  PhoneIcon,
  PlayIcon,
  PlusIcon,
  RefreshCcwIcon,
  SaveIcon,
  SearchIcon,
  SendIcon,
  SettingsIcon,
  ShieldIcon,
  ShieldCheckIcon,
  SlidersHorizontalIcon,
  SparklesIcon,
  SquareArrowOutUpRightIcon,
  SquarePenIcon,
  StarIcon,
  TrashIcon,
  TriangleAlertIcon,
  UploadIcon,
  UserIcon,
  UsersIcon,
  UsersRoundIcon,
  XIcon,
};

export const ICON_REGISTRY: Record<IconName, FC<SvgProps>> = {
  activity: ActivityIcon,
  "arrow-left": ArrowLeftIcon,
  camera: CameraIcon,
  calendar: CalendarIcon,
  check: CheckIcon,
  "chevron-down": ChevronDownIcon,
  "chevron-left": ChevronLeftIcon,
  "chevron-right": ChevronRightIcon,
  "chevron-up": ChevronUpIcon,
  "circle-x": CircleXIcon,
  clock: ClockIcon,
  copy: CopyIcon,
  download: DownloadIcon,
  ellipsis: EllipsisIcon,
  "ellipsis-vertical": EllipsisVerticalIcon,
  eye: EyeIcon,
  file: FileIcon,
  "file-text": FileTextIcon,
  globe: GlobeIcon,
  heart: HeartIcon,
  info: InfoIcon,
  "layout-grid": LayoutGridIcon,
  lightbulb: LightbulbIcon,
  "log-out": LogOutIcon,
  mail: MailIcon,
  "map-pin": MapPinIcon,
  menu: MenuIcon,
  pencil: PencilIcon,
  phone: PhoneIcon,
  play: PlayIcon,
  plus: PlusIcon,
  "refresh-ccw": RefreshCcwIcon,
  save: SaveIcon,
  search: SearchIcon,
  send: SendIcon,
  settings: SettingsIcon,
  shield: ShieldIcon,
  "shield-check": ShieldCheckIcon,
  "sliders-horizontal": SlidersHorizontalIcon,
  sparkles: SparklesIcon,
  "square-arrow-out-up-right": SquareArrowOutUpRightIcon,
  "square-pen": SquarePenIcon,
  star: StarIcon,
  trash: TrashIcon,
  "triangle-alert": TriangleAlertIcon,
  upload: UploadIcon,
  user: UserIcon,
  users: UsersIcon,
  "users-round": UsersRoundIcon,
  x: XIcon,
};

export const AVAILABLE_ICONS = [
  "activity",
  "arrow-left",
  "camera",
  "calendar",
  "check",
  "chevron-down",
  "chevron-left",
  "chevron-right",
  "chevron-up",
  "circle-x",
  "clock",
  "copy",
  "download",
  "ellipsis",
  "ellipsis-vertical",
  "eye",
  "file",
  "file-text",
  "globe",
  "heart",
  "info",
  "layout-grid",
  "lightbulb",
  "log-out",
  "mail",
  "map-pin",
  "menu",
  "pencil",
  "phone",
  "play",
  "plus",
  "refresh-ccw",
  "save",
  "search",
  "send",
  "settings",
  "shield",
  "shield-check",
  "sliders-horizontal",
  "sparkles",
  "square-arrow-out-up-right",
  "square-pen",
  "star",
  "trash",
  "triangle-alert",
  "upload",
  "user",
  "users",
  "users-round",
  "x",
] as const;

export type IconName = (typeof AVAILABLE_ICONS)[number];
