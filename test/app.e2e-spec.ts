import {Test} from "@nestjs/testing";
import {AppModule} from "../src/app.module";
import {HttpStatus, INestApplication, ValidationPipe} from "@nestjs/common";
import {PrismaService} from "../src/prisma/prisma.service";
import * as pactum from "pactum"
import {SignInDto, SignUpDto} from "../src/auth/dto";
import {EditUserDto} from "../src/user/dto";

describe('E-store E2E Testing', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  const BASE_URL = 'http://localhost:3333/';

  // compile whole app module for testing
  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule]
    }).compile();

    app = moduleRef.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({
      whitelist: true
    }));

    await app.init();
    await app.listen(3333);

    prisma = app.get(PrismaService);
    await prisma.cleanDB();
    pactum.request.setBaseUrl(BASE_URL);
  });

  afterAll(async () => {
    await app.close();
  });

  describe('Auth', () => {
    describe('Sign up', () => {
      it('should throw if email is empty', () => {
        return pactum.spec().post(`auth/signup`)
            .withBody({
              password: "123"
            })
            .expectStatus(HttpStatus.BAD_REQUEST)
      });

      it('should throw if password is empty', () => {
        return pactum.spec().post(`auth/signup`)
            .withBody({
              email: "amir@demo.com"
            })
            .expectStatus(HttpStatus.BAD_REQUEST)
      });

      it('should throw if both email & password are empty', () => {
        return pactum.spec().post(`auth/signup`)
            .withBody({})
            .expectStatus(HttpStatus.BAD_REQUEST)
      });

      it('should throw if both invalid email', () => {
        const signUpDto: SignUpDto = {
          email: "amir.demo.com",
          password: "123"
        }
        return pactum.spec().post(`auth/signup`)
            .withBody(signUpDto)
            .expectStatus(HttpStatus.BAD_REQUEST)
      });

      it('should sign up', () => {
        const signUpDto: SignUpDto = {
          email: "amir@demo.com",
          password: "123"
        }
        return pactum.spec().post(`auth/signup`)
            .withBody(signUpDto)
            .expectStatus(HttpStatus.CREATED)
      });
    })

    describe('Sign in', () => {
      it('should throw if invalid credential', () => {
        const signInDto: SignInDto = {
          email: "incorrect@email.com",
          password: "123"
        }
        return pactum.spec().post(`auth/signup`)
            .withBody({})
            .expectStatus(HttpStatus.BAD_REQUEST)
      });

      it('should sign in', () => {
        const signInDto: SignInDto = {
          email: "amir@demo.com",
          password: "123"
        }
        return pactum.spec().post('auth/signin')
            .withBody(signInDto)
            .expectStatus(HttpStatus.OK)
            .stores('userAt', 'access_token')
      });
    });
  });

  describe('User', () => {
    it('should throw if unauthorized', () => {
      return pactum.spec().get('users/me')
          .expectStatus(HttpStatus.UNAUTHORIZED);
    })

    it('should get user info', () => {
      return pactum.spec().get('users/me')
          .withHeaders({
            Authorization: 'Bearer $S{userAt}'
          })
          .expectStatus(HttpStatus.OK);
    })

    it('should throw if unauthorized updated', () => {
      const data: EditUserDto = {
        firstName: "Amir",
        lastName: "Ahmed"
      };

      return pactum.spec().patch('users')
          .withBody(data)
          .expectStatus(HttpStatus.UNAUTHORIZED);
    })

    it('should get update user info', () => {
      const data: EditUserDto = {
        firstName: "Amir",
        lastName: "Ahmed"
      };

      return pactum.spec().patch('users')
          .withHeaders({
            Authorization: 'Bearer $S{userAt}'
          })
          .withBody(data)
          .expectStatus(HttpStatus.OK)
          .expectBodyContains(data.firstName)
          .expectBodyContains(data.lastName)
          .inspect();
    })
  });

});