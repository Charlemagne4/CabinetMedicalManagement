import Image from "next/image";
import Link from "next/link";
import AuthButton from "@/modules/auth/ui/components/AuthButton";
import AddEntryModal from "@/modules/Entries/components/AddEntryModal";
import StartShiftModal from "@/modules/shifts/components/StartShiftModal";

export default function HomeNavbar() {
  return (
    <nav className="bg-background/80 sticky top-0 right-0 left-0 z-50 flex h-16 items-center ps-2 pr-5">
      <div className="flex w-full items-center justify-between gap-4">
        {/* Menu and logo */}
        <div className="flex shrink-0 items-center">
          <Link prefetch href={"/"} className="hidden md:block">
            <div className="flex items-center gap-1 p-4">
              <Image alt="Logo" src={"/logo.svg"} width={32} height={32} />
              <p className="text-xl font-semibold tracking-tight">Charlitube</p>
            </div>
          </Link>
        </div>
        {/* TODO: searchBar */}
        {/* <div className="mx-auto flex max-w-[720px] flex-1 justify-center">
          <SearchInput />
        </div> */}
        <div className="flex shrink-0 items-center gap-4">
          <StartShiftModal />
          <AddEntryModal />
          <AuthButton />
        </div>
      </div>
    </nav>
  );
}
