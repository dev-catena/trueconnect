# Use a imagem oficial do PHP 8.2 com FPM
FROM php:8.2-fpm

# Define o diretório de trabalho dentro do contêiner
WORKDIR /var/www/html

# Instala dependências do sistema necessárias para algumas extensões PHP
# `git`, `zip`, `unzip` são úteis para Composer e gerenciamento de arquivos
# `libpng-dev`, `libjpeg-dev`, `libwebp-dev`, `libzip-dev` são para extensões como GD, Zip
RUN apt-get update && apt-get install -y \
    git \
    zip \
    unzip \
    libpng-dev \
    libjpeg-dev \
    libwebp-dev \
    libzip-dev \
    libonig-dev \
    libcurl4-openssl-dev \
    libxml2-dev \
    && rm -rf /var/lib/apt/lists/*

# Instala extensões PHP comuns necessárias para o Laravel
# `pdo_mysql`: para conexão com o banco de dados MySQL
# `mbstring`: para funções de string multi-byte
# `exif`, `gd`: para manipulação de imagens (GD exige `libpng-dev`, `libjpeg-dev`)
# `zip`: para compressão/descompressão (exigido pelo Composer para algumas operações)
# `curl`: para requisições HTTP
# `xml`: para parsing XML
RUN docker-php-ext-configure gd --with-jpeg --with-webp \
    && docker-php-ext-install -j$(nproc) pdo_mysql mbstring exif gd zip curl xml

# Instala o Composer globalmente dentro do contêiner PHP
COPY --from=composer:latest /usr/bin/composer /usr/local/bin/composer

# Limpa o cache do apt para reduzir o tamanho da imagem
RUN apt-get clean && rm -rf /var/lib/apt/lists/*



# Expõe a porta 9000 para o PHP-FPM
EXPOSE 9000
