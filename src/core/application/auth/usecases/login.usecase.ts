import { Inject, Injectable, UnauthorizedException } from "@nestjs/common";
import { BcryptService } from "@infrastructure/security/bcrypt.service";
import { JwtService as CustomJwtService } from "@infrastructure/security/jwt.service";
import { USER_REPOSITORY, UserRepositoryPort } from "@core/domain/users/user.repository.port";
import { LoginDto, LoginResponse } from "../dto/login.dto";

@Injectable()
export class LoginUseCase {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: UserRepositoryPort,
    private readonly bcryptService: BcryptService,
    private readonly jwtService: CustomJwtService,
  ) {}

  async execute(dto: LoginDto): Promise<LoginResponse> {
    const user = await this.userRepository.findByEmail(dto.email);

    if (!user) {
      throw new UnauthorizedException("Credenciales inválidas");
    }

    const isPasswordValid = await this.bcryptService.compare(dto.password, user.password);

    if (!isPasswordValid) {
      throw new UnauthorizedException("Credenciales inválidas");
    }

    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role,
    };

    const accessToken = await this.jwtService.sign(payload);

    // Devolver tanto camelCase como snake_case para máxima compatibilidad
    return {
      accessToken,
      access_token: accessToken,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
      },
    };
  }
}