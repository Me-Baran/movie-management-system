import { Controller, Get, Param, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiResetContentResponse, ApiResponse, ApiTags } from "@nestjs/swagger";
import { JwtAuthGuard } from "../../secondary/security/jwt-adapter/jwt-auth.guard";
import { RolesGuard } from "../../secondary/security/utils/guards/roles.guard";
import { Userservice } from "src/modules/auth/application/services/user.service";
import { Roles } from "../../secondary/security/utils/decorators/roles.decorator";

@ApiTags('users')
@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class UserController {
    constructor(private readonly userService: Userservice) {}

    @Get(':id')
    @Roles('manager') // This attaches metadata('roles': ['manager']) to the method 
    @ApiOperation({summary: 'Get user by ID (managers only)'})
    @ApiResponse({
        status: 200,
        description: 'User found',
        schema: {
            type: 'object',
            properties: {
                id: {type: 'string'},
                username: {type: 'string'},
                role: {type: 'string'},
                age: {type: 'number'}
            }
        }
    })
    @ApiResponse({status: 401, description: 'Unauthorized'})
    @ApiResponse({status: 403, description: 'Forbidden - Requires manager role'})
    @ApiResponse({status: 404, description: 'User not found'})
    async getUserById(@Param('id') id: string) {
        const user = await this.userService.getUserById(id);
        return {
            id: user.getId(),
            username: user.getUsername(),
            role: user.getRole().getValue(),
            age: user.getAge()
        };
    }
}