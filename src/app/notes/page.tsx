import Button from "@/components/Button";
import NoteList from "@/components/NoteList";
import { getNotes } from "@/lib/server/notes";
import Link from "next/link";

export const metadata = {
  title: "NoteVine",
  description: "An application to create notes",
};

export default async function NoteListPage() {
  const notes = await getNotes();

  return (
    <div className="p-2 dark:text-white">
      <div className="flex flex-row justify-center py-2 px-10 md:px-[10%] lg:px-[25%]">
        <Link href="/notes/new" className="w-full  pb-5">
          <Button className="flex w-full flex-row items-center justify-center gap-4">
            New Note
          </Button>
        </Link>
      </div>

      <div className="px-10 md:px-[10%] lg:px-[20%]">
        <NoteList notes={notes} />
      </div>
    </div>
  );
}
