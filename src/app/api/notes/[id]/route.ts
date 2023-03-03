import { NoteService } from "@/lib/services/note.service";
import { RequestContext } from "@/lib/types/context";
import { json } from "@/lib/utils/responseUtils";

export async function DELETE(_: Request, ctx: RequestContext<{ id: string }>) {
  const noteService = new NoteService();
  const result = await noteService.deleteNote(ctx.params.id);

  if (result == null) {
    return json(404, { message: "Note not found" });
  }

  return json(result);
}