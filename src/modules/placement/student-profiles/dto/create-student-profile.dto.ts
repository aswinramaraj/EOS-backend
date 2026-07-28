import { IsOptional, IsUrl, MaxLength } from 'class-validator';

export class CreateStudentProfileDto {
  @IsOptional()
  @IsUrl()
  @MaxLength(500)
  resume_url?: string;

  @IsOptional()
  @IsUrl()
  @MaxLength(255)
  linkedin_url?: string;

  @IsOptional()
  @IsUrl()
  @MaxLength(255)
  github_url?: string;

  @IsOptional()
  @IsUrl()
  @MaxLength(255)
  leetcode_url?: string;

  @IsOptional()
  @IsUrl()
  @MaxLength(255)
  hackerrank_url?: string;

  @IsOptional()
  @IsUrl()
  @MaxLength(255)
  codeforces_url?: string;
}
