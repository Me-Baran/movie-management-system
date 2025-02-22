
```mermaid
flowchart TB
    %% Define all nodes first with positioning hints
    Client:::client
    Request["HTTP POST /auth/register"]:::client
    
    %% Primary Layer
    Primary:::primary
    VP["ValidationPipe\nmain.ts"]:::primary
    DTO["RegisterUserDto\nadapters/primary/dtos/\nregister-user.dto.ts"]:::primary
    AC["AuthController.register()\nadapters/primary/rest/\nauth.controller.ts"]:::primary
    
    %% Application Layer
    Application:::application
    CMD["RegisterUserCommand\napplication/commands/\nregister-user.command.ts"]:::application
    AS["AuthService.register()\napplication/services/\nauth.service.ts"]:::application
    IPS["IPasswordService\ndomain/services/\npassword.service.ts"]:::application
    
    %% Domain Layer  
    Domain:::domain
    UE["User Entity\ndomain/models/\nuser.entity.ts"]:::domain
    RV["Role ValueObject\ndomain/models/\nrole.value-object.ts"]:::domain
    CE["UserCreatedEvent\ndomain/events/\nuser-created.event.ts"]:::domain
    
    %% Secondary Layer
    Secondary:::secondary
    BPS["BcryptPasswordService\nadapters/secondary/security/\nbcrypt-password.service.ts"]:::secondary
    TUR["TypeormUserRepository\nadapters/secondary/persistence/\ntypeorm-user.repository.ts"]:::secondary
    EB["EventBus\n@nestjs/cqrs"]:::secondary
    UCH["UserCreatedHandler\nevent-handlers/\nuser-created.handler.ts"]:::secondary
    
    %% Subgraphs with specific ordering
    subgraph Client["Client"]
        Request
    end
    
    subgraph Primary["Primary Adapters Layer"]
        VP --> DTO --> AC
    end
    
    subgraph Application["Application Layer"]
        CMD --> AS
        AS --- IPS
    end
    
    subgraph Domain["Domain Layer"]
        UE
        RV
        CE
    end
    
    subgraph Secondary["Secondary Adapters Layer"]
        BPS
        TUR
        EB --> UCH
    end
    
    %% Flow connections outside subgraphs
    Request -->|1 . POST data| VP
    AC -->|4 . Create command| CMD
    AS -->|6 . Check if user exists| TUR
    AS -->|7 . Get role value object| RV
    AS -->|8 . Hash password| IPS
    IPS -.->|Interface| BPS
    BPS -->|9 . Return hashed password| AS
    AS -->|10 . Create user| UE
    UE -->|11 . Apply domain event| CE
    AS -->|12 . Save user| TUR
    TUR -->|13 . Return saved user| AS
    UE -->|14 . Event published| EB
    AS -->|16 . Return user data| AC
    AC -->|17 . HTTP Response| Request
    
    %% Styling
    classDef primary fill:#ffe6e6,stroke:#cc0000,stroke-width:2px
    classDef application fill:#e6f5ff,stroke:#006699,stroke-width:2px
    classDef domain fill:#f2ffe6,stroke:#336600,stroke-width:2px
    classDef secondary fill:#e6ffe6,stroke:#006600,stroke-width:2px
    classDef client fill:#f5f5f5,stroke:#333333,stroke-width:2px
    ```