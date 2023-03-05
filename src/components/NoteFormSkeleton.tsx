import MarkdownEditorLoading from "./MarkdownEditorLoading";

export default function NoteFormSkeleton() {
  return (
    <div className="flex w-full flex-col lg:px-[10%]">
      <div className="mb-2 flex flex-row justify-end">
        <button
          type="button"
          className="animate-pulse rounded-full  bg-slate-500 p-5 shadow-lg"
        ></button>
      </div>

      <div className="mb-2">
        <label className="mb-2 block h-6 w-20 animate-pulse rounded-md bg-slate-500">
          {/* Title */}
        </label>
        <div className="h-8 w-full animate-pulse rounded-md bg-slate-500">
          {/* Title Input */}
        </div>
      </div>

      <div className="mb-2">
        <label className="mb-2 block h-6 w-24 animate-pulse rounded-md bg-slate-500">
          {/* Content */}
        </label>
        <MarkdownEditorLoading />
      </div>

      <div className="mb-2 flex flex-row gap-2">
        <div className="h-10 w-[100px] animate-pulse rounded-md bg-slate-500">
          {/*  Submit Button */}
        </div>

        <div className="h-10 w-[100px] animate-pulse rounded-md bg-slate-500">
          {/*  Cancel Button */}
        </div>
      </div>
    </div>
  );
}