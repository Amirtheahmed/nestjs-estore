import {Test} from "@nestjs/testing";
import {AppModule} from "../src/app.module";
import {HttpStatus, INestApplication, ValidationPipe} from "@nestjs/common";
import {PrismaService} from "../src/prisma/prisma.service";
import * as pactum from "pactum"
import {SignInDto, SignUpDto} from "../src/auth/dto";
import {EditUserDto} from "../src/user/dto";
import {CreateCategoryDto, EditCategoryDto} from "../src/category/dto";

describe('E-store E2E Testing', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  const BASE_URL = 'http://localhost:3333/';

  /////////////////
  // setup
  /////////////////
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

  /////////////////
  // tests
  /////////////////
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
            .stores('accessToken', 'access_token')
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
            Authorization: 'Bearer $S{accessToken}'
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
            Authorization: 'Bearer $S{accessToken}'
          })
          .withBody(data)
          .expectStatus(HttpStatus.OK)
          .expectBodyContains(data.firstName)
          .expectBodyContains(data.lastName);
    })
  });

  describe('Category', () => {
    it('should throw if not authenticated', () => {
      return pactum
          .spec()
          .get('categories')
          .expectStatus(HttpStatus.UNAUTHORIZED);
    });

    it('should create parent category and store its ID', () => {
      const parentDto = {
        name: 'Electronics',
        description: 'Electronics Parent Category'
      };
      return pactum.spec()
          .post('categories')
          .withHeaders({ Authorization: 'Bearer $S{accessToken}' })
          .withBody(parentDto)
          .expectStatus(HttpStatus.CREATED)
          .stores('parentCategory', 'id');
    });

    it('should list categories', () => {
      return pactum
          .spec()
          .get('categories')
          .withHeaders({
            Authorization: 'Bearer $S{accessToken}'
          })
          .expectStatus(HttpStatus.OK)
          .expectJsonSchema('data',{
            "type": "array"
          }).expectJsonSchema('meta',{
            "type": "object"
          });
    });

    it('should throw when invalid child category', () => {
      const dto: CreateCategoryDto = {
        name: 'Electronics',
        description: 'All sort of electronic products',
        parentId: 123456
      }
      return pactum
          .spec()
          .post('categories/')
          .withHeaders({
            Authorization: 'Bearer $S{accessToken}'
          })
          .withBody(dto)
          .expectStatus(HttpStatus.NOT_FOUND);
    });

    it('should create child category under the parent and store its ID', () => {
      const childDto = {
        name: 'Mobile Phones',
        description: 'Mobile Phones under Electronics',
        parentId: '$S{parentCategory}'
      };
      return pactum.spec()
          .post('categories')
          .withHeaders({ Authorization: 'Bearer $S{accessToken}' })
          .withBody(childDto)
          .expectStatus(HttpStatus.CREATED)
          .stores('childCategory', 'id');
    });

    it('should throw when invalid category id', () => {
      return pactum
          .spec()
          .get('categories/{id}')
          .withPathParams('id', 123456)
          .withHeaders({
            Authorization: 'Bearer $S{accessToken}'
          }).expectStatus(HttpStatus.NOT_FOUND);
    });

    it('should get category by id', () => {
      return pactum
          .spec()
          .get('categories')
          .withPathParams('id', '$S{childCategory}')
          .withHeaders({
            Authorization: 'Bearer $S{accessToken}'
          })
          .expectStatus(HttpStatus.OK);
    });

    it('should edit category', () => {
      const dto: EditCategoryDto = {
        name: 'Updated Category Name',
        description: 'All sort of electronic products ... updated'
      }
      return pactum
          .spec()
          .patch('categories/{id}')
          .withPathParams('id', '$S{parentCategory}')
          .withHeaders({
            Authorization: 'Bearer $S{accessToken}'
          })
          .withBody(dto)
          .expectStatus(HttpStatus.OK)
          .expectBodyContains(dto.name)
          .expectBodyContains(dto.description);
    });

    it('should delete a category without children', async () => {
      const dto = {
        name: 'Temporary',
        description: 'A temporary category'
      };
      const id = await pactum.spec()
          .post('categories')
          .withHeaders({ Authorization: 'Bearer $S{accessToken}' })
          .withBody(dto)
          .expectStatus(HttpStatus.CREATED)
          .returns('id');

      return pactum.spec()
          .delete(`categories/{id}`)
          .withPathParams('id', parseInt(id))
          .withHeaders({ Authorization: 'Bearer $S{accessToken}' })
          .expectStatus(HttpStatus.NO_CONTENT);
    });

    it('should not delete a category with children without explicit permission', () => {
      return pactum.spec()
          .delete(`categories/{id}`)
          .withPathParams('id', '$S{parentCategory}')
          .withHeaders({ Authorization: 'Bearer $S{accessToken}' })
          .expectStatus(HttpStatus.BAD_REQUEST)
          .expectBodyContains('Category has subcategories and cannot be deleted without deleting them.')
          .inspect();
    });

    it('should delete category along with subcategories', () => {
      return pactum
          .spec()
          .delete('categories/{id}')
          .withPathParams('id', '$S{parentCategory}')
          .withQueryParams('deleteChildren', true)
          .withHeaders({
            Authorization: 'Bearer $S{accessToken}'
          })
          .expectStatus(HttpStatus.NO_CONTENT);
    });

  });

});