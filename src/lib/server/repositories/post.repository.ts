import { z } from "zod";
import { prisma } from "../database/prisma";
import {
  CreatePost,
  createPostSchema,
  Post,
  postSchema,
  UpdatePost,
  updatePostSchema,
} from "../schemas/Post";
import { arrayPartition } from "../../utils/arrayUtils";
import { generateSlug } from "../../utils/generateSlug";

const getAllPostsOptionsSchema = z.object({
  search: z.string().optional(),
  tags: z.array(z.string()).optional(),
  pagination: z
    .object({
      page: z.number().min(1).optional(),
      limit: z.number().min(1).optional(),
    })
    .optional(),
});

export type GetAllPostsOptions = z.infer<typeof getAllPostsOptionsSchema>;

export class PostRepository {
  async getAll(options: GetAllPostsOptions = {}): Promise<Post[]> {
    const {
      search,
      skip,
      take,
      tags = [],
    } = getQueryCriteriaFromOptions(options);

    const result = await prisma.post.findMany({
      where: {
        content: { search },
        title: { search },
        tags: tags.length === 0 ? undefined : { some: { name: { in: tags } } },
      },
      take,
      skip,
      include: {
        tags: true,
      },
    });

    return result.map((x) => postSchema.parse(x));
  }

  async getById(id: string): Promise<Post | null> {
    const result = await prisma.post.findFirst({
      where: { id },
      include: { tags: true },
    });

    if (result == null) {
      return null;
    }

    return postSchema.parse(result);
  }

  async getBySlug(slug: string): Promise<Post | null> {
    const result = await prisma.post.findFirst({
      where: { slug },
      include: { tags: true },
    });

    if (result == null) {
      return null;
    }

    return postSchema.parse(result);
  }

  async create(post: CreatePost): Promise<Post> {
    const data = createPostSchema.parse(post);
    const slug = generateSlug(post.title.toLowerCase());
    const tags = post.tags || [];

    const result = await prisma.post.create({
      data: {
        title: data.title.trim(),
        content: data.content?.trim(),
        slug,
        tags: {
          create: tags,
        },
      },
    });

    return postSchema.parse(result);
  }

  async update(post: UpdatePost): Promise<Post | null> {
    const data = updatePostSchema.parse(trimStrings(post));
    const postToUpdate = await prisma.post.findFirst({
      where: { id: post.id },
      select: {
        id: true,
        content: true,
        title: true,
        slug: true
      },
    });

    if (postToUpdate == null) {
      return null;
    }

    // Only generate a new slug if the title changed
    const slug =
      data.title === postToUpdate.title
        ? postToUpdate.slug
        : generateSlug(post.title.toLowerCase());

    // The split the new and current tags
    const [newTags, tags] = arrayPartition(
      post.tags || [],
      (x) => x.id == null
    );

    const result = await prisma.post.update({
      where: { id: post.id },
      data: {
        ...postToUpdate,
        ...data,
        slug,
        tags: {
          // TODO: Not sure if this code will work anywhere,
          // we must be sure the tags are deleted first
          // and then we add the new tags, in that order.

          // Delete the relations not included in the current tags
          deleteMany: {
            id: {
              notIn: tags.map((x) => x.id!),
            },
          },

          // Insert the new tags
          create: newTags,
        },
      },
    });

    return postSchema.parse(result);
  }

  async delete(id: string): Promise<Post | null> {
    const postToDelete = await this.getById(id);

    if (postToDelete == null) {
      return null;
    }

    const result = await prisma.post.delete({
      where: { id },
    });

    return postSchema.parse(result);
  }
}

function trimStrings<T extends Record<string, unknown>>(obj: T): T {
  for (const key in obj) {
    const value = obj[key];

    if (typeof value === "string") {
      obj[key] = value.trim() as any;
    }
  }
  return obj;
}

function getQueryCriteriaFromOptions(options: GetAllPostsOptions) {
  const DEFAULT_LIMIT = 100;

  // On invalid parse we just ignore the result
  const optionsResult = getAllPostsOptionsSchema.safeParse(options);
  const { pagination, search, tags } = optionsResult.success
    ? options
    : ({} as GetAllPostsOptions);

  let skip: number | undefined;
  let take: number | undefined;

  if (pagination) {
    const page = pagination.page || 1;
    take = pagination.limit;
    skip = (page - 1) * (pagination.limit || DEFAULT_LIMIT);
  }

  return { search, take, skip, tags };
}
