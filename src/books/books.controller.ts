import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Put,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { UserRoles } from '@prisma/books-client';

import { BooksService } from './books.service';
import { CreateBookDto, UpdateBookDto } from './dtos';
import { BookType } from './interfaces';
import { JWTAuthGuard, RoleGuard } from 'common';

@Controller('books')
export class BooksController {
  constructor(private readonly booksService: BooksService) {}

  @UseGuards(JWTAuthGuard)
  @Get()
  async getBooks(): Promise<BookType[]> {
    return this.booksService.getBooks();
  }

  @UseGuards(JWTAuthGuard)
  @Get(':id')
  async getBookById(@Param('id') id: string): Promise<BookType> {
    const book = await this.booksService.getBookById(id);
    return book;
  }

  @UseGuards(JWTAuthGuard, new RoleGuard([UserRoles.ADMIN]))
  @Post()
  async createBook(@Body() dto: CreateBookDto): Promise<BookType> {
    return this.booksService.createBook(dto);
  }

  @UseGuards(JWTAuthGuard, new RoleGuard([UserRoles.ADMIN]))
  @Put(':id')
  async updateBook(
    @Param('id') id: string,
    @Body() updateBookDto: UpdateBookDto,
  ): Promise<BookType> {
    return this.booksService.updateBook(updateBookDto, id);
  }

  @UseGuards(JWTAuthGuard, new RoleGuard([UserRoles.ADMIN]))
  @Delete(':id')
  async deleteBook(@Param('id') id: string): Promise<boolean> {
    return this.booksService.deleteBook(id);
  }
}
