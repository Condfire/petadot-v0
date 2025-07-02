# Estrutura do Banco de Dados PetAdot

Este documento descreve a estrutura das tabelas do banco de dados da aplicação PetAdot.

## Tabela: events

Armazena informações sobre eventos relacionados a pets e ONGs.

| Coluna       | Tipo                    | Nullable | Default           | Descrição                                |
|--------------|-------------------------|----------|-------------------|------------------------------------------|
| id           | uuid                    | NO       | uuid_generate_v4() | Identificador único do evento            |
| name         | character varying       | NO       | null              | Nome/título do evento                    |
| description  | text                    | YES      | null              | Descrição detalhada do evento            |
| date         | timestamp with time zone| NO       | null              | Data e hora de início do evento          |
| end_date     | timestamp with time zone| YES      | null              | Data e hora de término do evento         |
| location     | text                    | NO       | null              | Local do evento                          |
| address      | text                    | YES      | null              | Endereço detalhado do evento             |
| city         | character varying       | YES      | null              | Cidade onde ocorrerá o evento            |
| state        | character varying       | YES      | null              | Estado onde ocorrerá o evento            |
| postal_code  | character varying       | YES      | null              | CEP do local do evento                   |
| image_url    | text                    | YES      | null              | URL da imagem do evento                  |
| ong_id       | uuid                    | YES      | null              | ID da ONG organizadora                   |
| user_id      | uuid                    | YES      | null              | ID do usuário que cadastrou o evento     |
| status       | character varying       | YES      | 'pending'         | Status do evento (pending/approved/rejected) |
| created_at   | timestamp with time zone| YES      | now()             | Data de criação do registro              |
| updated_at   | timestamp with time zone| YES      | now()             | Data da última atualização do registro   |

## Tabela: pets

Armazena informações sobre pets disponíveis para adoção.

| Coluna                    | Tipo              | Nullable | Default           | Descrição                                |
|---------------------------|-------------------|----------|-------------------|------------------------------------------|
| id                        | uuid              | NO       | uuid_generate_v4() | Identificador único do pet               |
| name                      | character varying | NO       | null              | Nome do pet                              |
| species                   | character varying | NO       | null              | Espécie (cachorro, gato, etc.)           |
| breed                     | character varying | YES      | null              | Raça do pet                              |
| age                       | character varying | YES      | null              | Idade aproximada                         |
| size                      | character varying | NO       | null              | Porte (pequeno, médio, grande)           |
| gender                    | character varying | NO       | null              | Gênero (macho, fêmea)                    |
| color                     | character varying | YES      | null              | Cor predominante                         |
| description               | text              | YES      | null              | Descrição detalhada do pet               |
| is_castrated             | boolean           | YES      | false             | Se o pet é castrado                      |
| is_vaccinated            | boolean           | YES      | false             | Se o pet está com vacinas em dia         |
| is_special_needs         | boolean           | YES      | false             | Se o pet tem necessidades especiais      |
| special_needs_description | text              | YES      | null              | Descrição das necessidades especiais     |
| image_url                 | text              | YES      | null              | URL da imagem do pet                     |
| ong_id                    | uuid              | YES      | null              | ID da ONG responsável                    |
| user_id                   | uuid              | YES      | null              | ID do usuário que cadastrou              |
| status                    | character varying | YES      | 'pending'         | Status (pending/approved/rejected)       |
| created_at                | timestamp with time zone | YES | now()           | Data de criação do registro              |
| updated_at                | timestamp with time zone | YES | now()           | Data da última atualização               |

## Tabela: pets_lost

Armazena informações sobre pets perdidos.

| Coluna            | Tipo              | Nullable | Default           | Descrição                                |
|-------------------|-------------------|----------|-------------------|------------------------------------------|
| id                | uuid              | NO       | uuid_generate_v4() | Identificador único do registro          |
| name              | character varying | YES      | null              | Nome do pet (se conhecido)               |
| species           | character varying | NO       | null              | Espécie (cachorro, gato, etc.)           |
| breed             | character varying | YES      | null              | Raça do pet                              |
| age               | character varying | YES      | null              | Idade aproximada                         |
| size              | character varying | NO       | null              | Porte (pequeno, médio, grande)           |
| gender            | character varying | NO       | null              | Gênero (macho, fêmea)                    |
| color             | character varying | YES      | null              | Cor predominante                         |
| description       | text              | YES      | null              | Descrição detalhada do pet               |
| last_seen_date    | timestamp with time zone | NO | null              | Data em que o pet foi visto pela última vez |
| last_seen_location| text              | NO       | null              | Local onde o pet foi visto pela última vez |
| contact           | character varying | NO       | null              | Informações de contato                   |
| image_url         | text              | YES      | null              | URL da imagem do pet                     |
| user_id           | uuid              | YES      | null              | ID do usuário que cadastrou              |
| status            | character varying | YES      | 'pending'         | Status (pending/approved/rejected)       |
| created_at        | timestamp with time zone | YES | now()           | Data de criação do registro              |
| updated_at        | timestamp with time zone | YES | now()           | Data da última atualização               |

## Tabela: pets_found

Armazena informações sobre pets encontrados.

| Coluna            | Tipo              | Nullable | Default           | Descrição                                |
|-------------------|-------------------|----------|-------------------|------------------------------------------|
| id                | uuid              | NO       | uuid_generate_v4() | Identificador único do registro          |
| name              | character varying | YES      | null              | Nome dado ao pet (se aplicável)          |
| species           | character varying | NO       | null              | Espécie (cachorro, gato, etc.)           |
| breed             | character varying | YES      | null              | Raça do pet                              |
| size              | character varying | NO       | null              | Porte (pequeno, médio, grande)           |
| gender            | character varying | NO       | null              | Gênero (macho, fêmea)                    |
| color             | character varying | YES      | null              | Cor predominante                         |
| description       | text              | YES      | null              | Descrição detalhada do pet               |
| found_date        | timestamp with time zone | NO | null              | Data em que o pet foi encontrado         |
| found_location    | text              | NO       | null              | Local onde o pet foi encontrado          |
| current_location  | text              | YES      | null              | Local onde o pet está atualmente         |
| contact           | character varying | NO       | null              | Informações de contato                   |
| image_url         | text              | YES      | null              | URL da imagem do pet                     |
| user_id           | uuid              | YES      | null              | ID do usuário que cadastrou              |
| status            | character varying | YES      | 'pending'         | Status (pending/approved/rejected)       |
| created_at        | timestamp with time zone | YES | now()           | Data de criação do registro              |
| updated_at        | timestamp with time zone | YES | now()           | Data da última atualização               |

## Tabela: ongs

Armazena informações sobre ONGs parceiras, incluindo formas de contato.

| Coluna            | Tipo              | Nullable | Default           | Descrição                                |
|-------------------|-------------------|----------|-------------------|------------------------------------------|
| id                | uuid              | NO       | uuid_generate_v4() | Identificador único da ONG               |
| name              | character varying | NO       | null              | Nome da ONG                              |
| description       | text              | YES      | null              | Descrição da ONG                         |
| logo_url          | text              | YES      | null              | URL do logo da ONG                       |
| contact_email     | text              | YES      | null              | Email de contato da ONG                  |
| contact_phone     | character varying | YES      | null              | Telefone de contato da ONG               |
| website           | text              | YES      | null              | Website da ONG                           |
| address           | text              | YES      | null              | Endereço da ONG                          |
| city              | character varying | YES      | null              | Cidade onde a ONG está localizada        |
| state             | character varying | YES      | null              | Estado onde a ONG está localizada        |
| postal_code       | character varying | YES      | null              | CEP da ONG                               |
| cnpj              | character varying | YES      | null              | CNPJ da ONG                              |
| user_id           | uuid              | YES      | null              | ID do usuário associado à ONG            |
| is_verified       | boolean           | YES      | false             | Se a ONG foi verificada pela plataforma  |
| created_at        | timestamp with time zone | YES | now()           | Data de criação do registro              |
| updated_at        | timestamp with time zone | YES | now()           | Data da última atualização               |

## Tabela: users

Armazena informações sobre usuários da plataforma.

| Coluna            | Tipo              | Nullable | Default           | Descrição                                |
|-------------------|-------------------|----------|-------------------|------------------------------------------|
| id                | uuid              | NO       | null              | Identificador único do usuário (mesmo do auth) |
| email             | character varying | NO       | null              | Email do usuário                         |
| name              | character varying | YES      | null              | Nome completo do usuário                 |
| phone             | character varying | YES      | null              | Telefone de contato                      |
| address           | text              | YES      | null              | Endereço do usuário                      |
| city              | character varying | YES      | null              | Cidade onde o usuário reside             |
| state             | character varying | YES      | null              | Estado onde o usuário reside             |
| postal_code       | character varying | YES      | null              | CEP do usuário                           |
| profile_image     | text              | YES      | null              | URL da imagem de perfil                  |
| is_admin          | boolean           | YES      | false             | Se o usuário é administrador             |
| created_at        | timestamp with time zone | YES | now()           | Data de criação do registro              |
| updated_at        | timestamp with time zone | YES | now()           | Data da última atualização               |
\`\`\`

## 3. Criar uma camada de mapeamento

Agora, vamos criar uma camada de mapeamento para converter entre os formatos da UI e do banco de dados:
