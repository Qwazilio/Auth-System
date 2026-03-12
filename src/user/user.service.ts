import {Injectable, NotFoundException} from '@nestjs/common';
import {PrismaService} from "../prisma/prisma.service";
import {Prisma, User} from "@prisma/client";

type FindUserParams = {
    email?: string
    login?: string
}

@Injectable()
export class UserService {
    constructor(
        private readonly prisma: PrismaService,
    ) {}

    async createUser(data: Prisma.UserCreateInput): Promise<Partial<User>> {
        return this.prisma.user.create({
            data,
            select: {
                id: true,
                email: true,
                login: true,
                createdAt: true,
                updatedAt: true,
            }
        });
    }

    //Геты для конечной операции
    async getUser(id: number): Promise<Partial<User>> {
        const user = await this.prisma.user.findUnique({
            select: {
                id: true,
                login: true,
                email: true,
                createdAt: true,
                updatedAt: true,
            },
            where: {id}
        });

        if (!user) {
            throw new NotFoundException("User not found")
        }

        return user as Partial<Partial<User>>;
    }

    async getAllUsers(): Promise<Partial<User>[]> {
        const users = await this.prisma.user.findMany({
            select: {
                id: true,
                login: true,
                email: true,
                createdAt: true,
                updatedAt: true,
            }
        });
        if (!users) throw new NotFoundException("Users not found");
        return users;
    }

    //Финды для внутренего поиска
    async findUserByEmailOrLogin(
        params: FindUserParams,
    ): Promise<User | null> {
        return this.prisma.user.findFirst({
            where: {
                OR: [
                    { email: params.email },
                    { login: params.login },
                ],
            },
        })
    }
}
