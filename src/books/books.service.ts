import { HttpException, HttpStatus, Injectable } from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service';
import { Books } from '@prisma/booksCollection-client';
import { CreateBookDto, UpdateBookDto } from './dtos';

@Injectable()
export class BooksService {
  constructor(private readonly _prisma: PrismaService) {}

  async getBooks(): Promise<Books[]> {
    const books = await this._prisma.books.findMany({});
    if (!books) {
      return [];
    }
    return books;
  }

  async createBook(dto: CreateBookDto): Promise<Books> {
    const { title, author, genres, publicationDate } = dto;
    const convertedDate = new Date(publicationDate);
    const newBook = await this._prisma.books.create({
      data: {
        title,
        author,
        genres,
        publication_date: convertedDate,
      },
    });
    return newBook;
  }

  async getBookById(id: string): Promise<Books> {
    const book = await this._prisma.books.findFirst({
      where: {
        id,
      },
    });
    if (!book) {
      throw new HttpException('Book not found', HttpStatus.NOT_FOUND);
    }
    return book;
  }

  async updateBook(dto: UpdateBookDto, id: string): Promise<Books> {
    const { title, author, genres, publicationDate } = dto;
    const convertedDate = new Date(publicationDate);
    const book = await this._prisma.books.update({
      where: {
        id,
      },
      data: {
        title,
        author,
        genres,
        publication_date: convertedDate,
      },
    });
    if (!book) {
      throw new HttpException('Book not found', HttpStatus.NOT_FOUND);
    }
    return book;
  }

  async deleteBook(id: string): Promise<boolean> {
    const book = await this._prisma.books.delete({
      where: {
        id,
      },
    });
    if (!book) {
      throw new HttpException('Book not found', HttpStatus.NOT_FOUND);
    }
    return true;
  }
}
