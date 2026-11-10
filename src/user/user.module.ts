import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { UserController } from './user.controller';
import { UserService } from './user.service';

@Module({
  // forFeature enregistre le repository de l'entite dans CE module.
  imports: [TypeOrmModule.forFeature([User])],
  controllers: [UserController],
  providers: [UserService],
  // Exporte pour AuthModule (login/signup) et pour le seeder.
  exports: [UserService],
})
export class UserModule {}
