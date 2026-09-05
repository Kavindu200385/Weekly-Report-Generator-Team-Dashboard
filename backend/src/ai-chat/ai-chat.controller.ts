import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { AiChatService } from './ai-chat.service';
import { AskQuestionDto } from './dto/ask-question.dto';
import { Roles } from '../auth/decorators/roles.decorator';

@Roles('manager')
@Controller('ai')
export class AiChatController {
  constructor(private readonly aiChatService: AiChatService) {}

  @Post('ask')
  ask(@Body() dto: AskQuestionDto) {
    return this.aiChatService.ask(dto.question);
  }

  @Get('team-summary')
  teamSummary(@Query('week') week: string) {
    return this.aiChatService.teamSummary(week);
  }
}
