import { useEffect } from "react";
import { Columns } from "../domains/Column.ts";

type Column = [string, ...number[]];
type Group = string[]
type Types = { [key: string]: "area" };

declare global {
  interface C3Options {
    bindTo: string | Element;
    size?: {
      width?: number;
      height?: number;
    };
    padding?: {
      top?: number;
      right?: number;
      bottom?: number;
      left?: number;
    };
    data?: {
      columns?: Column[];
      groups?: Group[];
      types?: Types;
    };
    axis?: {
      x?: {
        type?: "category";
        categories?: string[];
        tick?: {
          curring?: {
            max?: number;
          };
        };
      };
      y?: {
        min: number;
      };
    };
    subchart?: {
      show?: boolean;
    }
  }

  interface C3Api {}
  export interface Window {
    c3: {
      generate(opt: C3Options): C3Api;
    }
  }
}
type Categories = Required<Required<C3Options>["axis"]>["x"]["categories"];
export function useC3(data?: C3Options["data"], categories?: Categories) {
  console.log(data);
  useEffect(() => {
    if (data && categories) {
      window.c3.generate({
        bindTo: "#chart",
        data,
        axis: {
          x: {
            type: "category",
            categories: data!.columns!.map(it => it[0])
          }
        },
        size: {
          height: 768
        }
      });
    }
  }, [data]);
}
