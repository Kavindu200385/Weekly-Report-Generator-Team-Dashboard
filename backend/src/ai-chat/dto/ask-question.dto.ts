import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class AskQuestionDto {
  @IsNotEmpty()
  @IsString()
  @MaxLength(500)
  question: string;
}
