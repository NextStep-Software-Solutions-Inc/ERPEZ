import React from "react";
import * as NavigationMenu from "@radix-ui/react-navigation-menu";
import { ChevronDown } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { menusConfig } from "@/config/menus";
import { cn, translate } from "@/lib/utils";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function MainMenu() {
  const menus = menusConfig.mainNav || [];

  const [offset, setOffset] = React.useState<number | null>(null);
  const [list, setList] = React.useState<HTMLUListElement | null | undefined>();
  const [value, setValue] = React.useState<string | null>();

  const onNodeUpdate = (trigger: any, itemValue: any) => {
    if (trigger && list && value === itemValue) {
      const triggerOffsetLeft = trigger.offsetLeft + trigger.offsetWidth / 6;

      setOffset(Math.round(triggerOffsetLeft));
    } else if (value === "") {
      setOffset(null);
    }
    return trigger;
  };

  return (
    <div>
      <NavigationMenu.Root
        onValueChange={setValue}
        className=" flex relative  justify-start group "
      >
        <NavigationMenu.List
          ref={setList}
          className="group flex list-none gap-5"
        >
          {menus?.map((item: any, index: number) => (
            <NavigationMenu.Item key={`item-${index}`} value={item}>
              <NavigationMenu.Trigger
                ref={(node) => onNodeUpdate(node, item)}
                asChild
                className=" flex items-center"
              >
                <div className=" flex items-center  py-4 cursor-pointer group data-[state=open]:text-primary">
                  <item.icon className="h-5 w-5 mr-2" />
                  <span className="text-sm font-medium text-default-700">
                    {translate(item.title)}
                  </span>
                  <ChevronDown
                    className="relative top-px ml-1 h-4 w-4 transition duration-200 group-data-[state=open]:rotate-180"
                    aria-hidden="true"
                  />
                </div>
              </NavigationMenu.Trigger>
              <NavigationMenu.Content
                className={cn(
                  "w-full  rounded-md border bg-popover text-popover-foreground shadow-lg   "
                )}
              >
                {item.child && (
                  <div className=" min-w-[200px] p-4">
                    {item.child?.map((childItem: any, idx: number) => (
                      <ListItem
                        className="text-sm font-medium text-default-700"
                        key={`child-${idx}`}
                        title={childItem.title}
                        href={childItem.href}
                        childItem={childItem}
                      >
                        <childItem.icon className="h-5 w-5" />
                      </ListItem>
                    ))}
                  </div>
                )}

                {item.megaMenu && (
                  <div className="">
                    <Tabs
                      defaultValue={item.megaMenu[0].title}
                      onValueChange={setValue}
                      className="inline-block p-0"
                    >
                      <TabsList className="bg-transparent p-0 border-b-2 py-7 px-[30px] rounded-none w-full justify-start gap-10">
                        {item.megaMenu?.map((tab: any, idx: number) => (
                          <TabsTrigger
                            key={`tab-${idx}`}
                            value={tab.title}
                            className="capitalize  data-[state=active]:shadow-none  data-[state=active]:bg-transparent data-[state=active]:text-primary transition duration-150 before:transition-all before:duration-150 relative before:absolute
                            before:left-1/2 before:-bottom-[30px] before:h-[2px] px-0
                            before:-translate-x-1/2 before:w-0 data-[state=active]:before:bg-primary data-[state=active]:before:w-full"
                          >
                            <tab.icon className="h-5 w-5 mr-2" />
                            <span className="text-sm font-medium text-default-700">
                              {tab.title}
                            </span>
                          </TabsTrigger>
                        ))}
                      </TabsList>

                      {item.megaMenu?.map((tab: any, idx: number) => (
                        <TabsContent
                          key={`tab2-${idx}`}
                          value={tab.title}
                          className={cn(" grid grid-cols-12 gap-4 px-6 py-2", {
                            "gap-2": tab?.child?.length < 10,
                          })}
                        >
                          <div
                            className={cn(
                              "col-span-8  grid gap-3 grid-cols-3",
                              {
                                "col-span-5 grid-cols-1  ":
                                  tab?.child?.length < 10,
                              }
                            )}
                          >
                            {tab?.child?.map((megaChild: any) => (
                              <ListItem
                                className="mb-0 text-sm font-medium text-default-600"
                                key={`child-${megaChild.title}`}
                                title={megaChild.title}
                                href={megaChild.href}
                                childItem={megaChild}
                              />
                            ))}
                          </div>
                          <div
                            className={cn("col-span-4 ", {
                              "col-span-7 ": tab?.child?.length < 10,
                            })}
                          >
                            <div className="h-full w-full  text-center">
                              <img
                                src="/images/all-img/man-with-laptop.png"
                                alt=""
                                style={{ objectFit: "cover" }}
                                height={100}
                                width={100}
                              />
                            </div>
                          </div>
                        </TabsContent>
                      ))}
                    </Tabs>
                  </div>
                )}
              </NavigationMenu.Content>
            </NavigationMenu.Item>
          ))}
        </NavigationMenu.List>

        <div className=" absolute  top-full ">
          <NavigationMenu.Viewport
            style={{
              display: !offset ? "none" : undefined,
              transform: `translateX(${offset}px)`,
              top: "100%",
              transition: "all 0.5s ease",
            }}
          />
        </div>
      </NavigationMenu.Root>
    </div>
  );
}

const ListItem = React.forwardRef<HTMLAnchorElement, any>(
  (
    { className, children, title, childItem, trans, ...props },
    forwardedRef
  ) => (
    <NavigationMenu.Link asChild>
      <Link
        to={props.href ?? "#"}
        className={cn(
          " select-none   text-sm  text-default-700 rounded-md flex  items-center gap-2 mb-4 last:mb-0  leading-none no-underline outline-none transition-colors  hover:text-primary  focus:text-primary",
          className
        )}
        {...props}
        ref={forwardedRef}
      >
        <div>{children}</div>
        <div className=" capitalize">{translate(title, trans)}</div>
      </Link>
    </NavigationMenu.Link>
  )
);
