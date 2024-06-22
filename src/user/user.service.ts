import { Injectable } from '@nestjs/common';

import { DatabaseService } from 'src/database/database.service';

@Injectable()
export class UserService {
  constructor(private readonly databaseService: DatabaseService) {}

  async updateProfile(
    userId: number,
    fullName: string,
    avatarUrl: string | void,
  ) {
    if (avatarUrl) {
      return await this.databaseService.user.update({
        where: { id: userId },
        data: { fullName, avatarUrl },
      });
    }

    return await this.databaseService.user.update({
      where: { id: userId },
      data: { fullName },
    });
  }
}
