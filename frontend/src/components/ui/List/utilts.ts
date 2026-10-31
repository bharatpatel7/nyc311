import { BASE_LIST_ITEM, SELECTED, UNSELECTED_DEFAULT, UNSELECTED, FOCUSED } from "./styles";

export const listOptionClass = (selected: boolean, focused: boolean, muted: boolean) =>
  `${BASE_LIST_ITEM} ${selected ? SELECTED : muted ? UNSELECTED_DEFAULT : UNSELECTED} ${focused ? FOCUSED : ""}`;
