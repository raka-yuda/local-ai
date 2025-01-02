import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { Button } from "@/components/ui/button";
import { Sheet, SheetClose, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { MessageSquare, Info, Edit, Home, ChevronRight } from "lucide-react";

function Sidebar() {
  const [isOpen, setIsOpen] = useState(false);
  const [isSidebarVisible, setIsSidebarVisible] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setIsSidebarVisible(false);
      } else {
        setIsSidebarVisible(true);
      }
    };

    window.addEventListener('resize', handleResize);
    handleResize();

    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const navItems = [
    { href: '/', label: 'Home', icon: Home },
    { href: '/chat-stream', label: 'Chat', icon: MessageSquare },
    { href: '/mdx-chat', label: 'MDX Writer', icon: Edit },
    // { href: '/settings', label: 'Settings', icon: Settings },
  ];

  const SidebarContent = ({ onClose }) => (
    <div className="flex flex-col">
      {/* <div className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center space-x-2">
          <MessageSquare className="h-6 w-6 text-indigo-600" />
          <h2 className="text-2xl font-bold text-gray-800">Assistant</h2>
        </div>
        <Button variant="ghost" size="icon" onClick={onClose} className="md:hidden">
          <X className="h-4 w-4" />
        </Button>
      </div> */}
      {/* <ScrollArea className="flex flex-grow"> */}
        <nav className="space-y-1">
          {navItems.map((item) => (
            <Link key={item.href} href={item.href} passHref>
              <Button
                variant={router.pathname === item.href ? "secondary" : "ghost"}
                className="w-full justify-start"
                onClick={onClose}
              >
                <item.icon className="mr-2 h-4 w-4" />
                {item.label}
              </Button>
            </Link>
          ))}
        </nav>
      {/* </ScrollArea> */}
      <div className="flex p-4 border-t">
        <Button variant="outline" className="w-full" onClick={() => console.log('Help clicked')}>
          <Info className="mr-2 h-4 w-4" />
          Help & Resources
        </Button>
      </div>
    </div>
  );

  return (
    <>
    {/* <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          className="fixed top-4 left-4 z-50 md:hidden"
        >
          <Menu className="h-4 w-4" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="p-0 w-[300px] sm:w-[400px]">
        <SidebarContent onClose={() => setIsOpen(false)} />
      </SheetContent>
    </Sheet>

    <div className={`hidden md:flex md:flex-col md:fixed md:inset-y-0 transition-all duration-300 ${isSidebarVisible ? 'md:w-64' : 'md:w-0'}`}>
      <div className="flex-1 flex flex-col min-h-0 bg-white border-r border-gray-200 overflow-hidden">
        {isSidebarVisible && <SidebarContent onClose={() => {}} />}
      </div>
    </div>

    <Button
      variant="outline"
      size="icon"
      className={`fixed top-4 z-50 hidden md:flex transition-all duration-300 ${
        isSidebarVisible ? 'left-64' : 'left-0'
      }`}
      onClick={() => setIsSidebarVisible(!isSidebarVisible)}
    >
      {isSidebarVisible ? <ChevronLeft className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
    </Button> */}
      <Sheet>
        <SheetTrigger asChild className='fixed top-4 z-50 flex md:p-2 p-0'>
          <Button className="rounded-none rounded-e-lg outline">
            <ChevronRight className='w-4 h-4'/>
           </Button>
        </SheetTrigger>
        <SheetContent side={"left"} className={"flex flex-col"}>
          {/* <div className='absolute top-0 left-0'>
            <Button className="rounded-none rounded-e-md outline">
              <ChevronRight className='w-4 h-4 '/>
            </Button>
          </div> */}
          <SheetHeader>
            <SheetTitle>Assistant</SheetTitle>
            <SheetDescription>
              {"We're here to help your any randomness and lead you to the right way."}
            </SheetDescription>
          </SheetHeader>
          
          <div className="flex flex-col flex-1">
            <nav className="space-y-1">
              {navItems.map((item) => (
                <Link key={item.href} href={item.href} passHref>
                  <Button
                    variant={router.pathname === item.href ? "secondary" : "ghost"}
                    className="w-full justify-start"
                    // onClick={onClose}
                  >
                    <item.icon className="mr-2 h-4 w-4" />
                    {item.label}
                  </Button>
                </Link>
              ))}
            </nav>
          </div>
          {/* <SheetFooter className={"flex border-t py-4"}>
            <SheetClose asChild>
                <Button variant="outline" className="w-full" onClick={() => console.log('Help clicked')}>
                  <Info className="mr-2 h-4 w-4" />
                  Help & Resources
                </Button>
            </SheetClose>
          </SheetFooter> */}
          <div className='absolute top-4 md:-right-[34px] -right-[18px] '>
            <SheetClose asChild>
              <Button className="rounded-none rounded-e-md flex md:p-2 p-0">
                <ChevronRight className='w-4 h-4 '/>
              </Button>
            </SheetClose>
          </div>
        </SheetContent>
      </Sheet>
  </>
  );
}

export default Sidebar;