import { PartialType } from '@nestjs/mapped-types';
import { CreateSkillDto } from './create-skill.dto';

/**
 * PartialType rend tous les champs de CreateSkillDto optionnels :
 * c'est exactement ce dont on a besoin pour un PATCH.
 */
export class UpdateSkillDto extends PartialType(CreateSkillDto) {}
