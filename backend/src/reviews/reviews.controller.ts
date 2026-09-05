import { Body, Controller, Get, Param, ParseIntPipe, Post } from '@nestjs/common';
import { ReviewsService } from './reviews.service';
import { CreateReviewDto } from './dto/create-review.dto';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser, CurrentUserPayload } from '../auth/decorators/current-user.decorator';

@Controller('reports')
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  @Roles('manager')
  @Post(':id/review')
  createReview(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: CurrentUserPayload,
    @Body() dto: CreateReviewDto,
  ) {
    return this.reviewsService.createReview(id, user.sub, dto);
  }

  @Get(':id/reviews')
  getReviews(@Param('id', ParseIntPipe) id: number, @CurrentUser() user: CurrentUserPayload) {
    return this.reviewsService.getReviewHistory(id, user.sub, user.role);
  }
}
