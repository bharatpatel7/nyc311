import { forwardRef } from "react";
import type { ListProps } from "./types";
import { BASE_LIST } from "./styles";

const List = forwardRef<HTMLUListElement, ListProps>(({ id, children, className }, ref) => (
  <ul
    ref={ref}
    id={`${id}-listbox`}
    role="listbox"
    aria-labelledby={`${id}-label`}
    className={className ?? BASE_LIST}
  >
    {children}
  </ul>
));

export default List;
