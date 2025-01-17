import {
  Get,
  Post,
  Body,
  Controller,
  UsePipes,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import { UserService } from './user.service';
import { UserResponseObject } from './user.model';
import { CreateUserDto, LoginUserDto, UpdatePasswordDto } from './dto';
import { HttpException } from '@nestjs/common/exceptions/http.exception';
import { UserDecorator } from './user.decorator';
import { ValidationPipe } from '../../shared/pipes/validation.pipe';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
} from '@nestjs/swagger';
import { DeleteUserDto } from './dto/delete-user.dto';
import { RolesGuard } from '../../roles.guard';

@ApiTags('user')
@Controller('user')
export class UserController {
  private readonly userService: UserService;
  public constructor(userService: UserService) {
    this.userService = userService;
  }

  @ApiBearerAuth()
  @UseGuards(RolesGuard)
  @ApiOperation({ summary: 'Sign-up new user' })
  @ApiResponse({
    status: 201,
    description: 'New user email and login token',
    type: UserResponseObject,
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden',
  })
  @UsePipes(new ValidationPipe())
  @Post()
  public async create(
    @Body() userData: CreateUserDto,
  ): Promise<UserResponseObject> {
    return this.userService.create(userData);
  }

  @ApiOperation({ summary: 'Log in existing user' })
  @UsePipes(new ValidationPipe())
  @Post('login')
  public async login(
    @Body() loginUserDto: LoginUserDto,
  ): Promise<UserResponseObject> {
    const _user = await this.userService.findOne(loginUserDto);
    if (!_user) {
      throw new HttpException('Unauthorized', HttpStatus.UNAUTHORIZED);
    }

    const token = await this.userService.generateJWT(_user);
    const { email } = _user;
    const user = {
      email,
      token,
    };

    return { user };
  }

  @ApiBearerAuth()
  @UseGuards(RolesGuard)
  @ApiOperation({ summary: 'Change password of logged in user' })
  @Post('change-password')
  public async update(
    @UserDecorator('id') userId: string,
    @Body() userData: UpdatePasswordDto,
  ): Promise<UserResponseObject> {
    return this.userService.update(userId, userData);
  }

  @ApiBearerAuth()
  @UseGuards(RolesGuard)
  @ApiOperation({ summary: 'Get current user' })
  @Get()
  public async findMe(
    @UserDecorator('email') email: string,
  ): Promise<UserResponseObject> {
    return await this.userService.findByEmail(email);
  }

  @ApiBearerAuth()
  @UseGuards(RolesGuard)
  @ApiOperation({ summary: 'Delete current user and storage' })
  @Post('delete')
  public async deleteAccount(
    @UserDecorator('id') userId: string,
    @Body() passwordData: DeleteUserDto,
  ): Promise<void> {
    return await this.userService.deleteAccount(userId, passwordData);
  }
}
