# Documentação do Script de Importação de Dados (import_data.pl)

## Visão Geral

O script `import_data.pl` é responsável por importar dados de um arquivo CSV para o banco de dados do sistema OMLPI.
Ele processa informações sobre indicadores, subindicadores e seus respectivos valores para diferentes localidades e anos.

## Funcionalidades Principais

1. **Verificação de Checksum**: O script calcula o checksum MD5 do arquivo de dados e compara com o último checksum armazenado no banco de dados para evitar importações desnecessárias.

2. **Descompressão de Arquivos**: Utiliza a biblioteca Archive::Zip para descomprimir o arquivo de dados.

3. **Importação de Indicadores**: Carrega informações básicas dos indicadores, como descrição, área, base de dados e ODSs relacionados.

4. **Importação de Subindicadores**: Processa os desagregadores (subindicadores) associados a cada indicador.

5. **Importação de Dados**: Carrega os valores dos indicadores e subindicadores para cada localidade e ano.

6. **Tratamento de Dados**: Realiza conversões e formatações nos valores numéricos para garantir consistência no banco de dados.

7. **Atualização de Visões Materializadas**: Atualiza as visões materializadas utilizadas para consultas rápidas de indicadores aleatórios.

## Processo Detalhado

1. **Inicialização**:
   - Configura o logger para registro de atividades.
   - Conecta-se ao banco de dados PostgreSQL.

2. **Verificação de Atualização**:
   - Calcula o checksum MD5 do arquivo de dados.
   - Compara com o último checksum armazenado no banco de dados.
   - Se forem iguais, encerra o script (não há atualizações).

3. **Processamento de Indicadores**:
   - Lê o arquivo "indicadores.csv".
   - Insere ou atualiza informações dos indicadores no banco de dados.

4. **Processamento de Subindicadores**:
   - Lê o arquivo "desagregadores.csv".
   - Insere ou atualiza informações dos subindicadores no banco de dados.

5. **Processamento de Dados**:
   - Lê o arquivo "dados.csv".
   - Para cada linha:
     - Verifica e formata os valores numéricos.
     - Insere os dados dos indicadores na tabela temporária `indicator_locale_bulk`.
     - Insere os dados dos subindicadores na tabela temporária `subindicator_locale_bulk`.
   - Após o processamento, copia os dados das tabelas temporárias para as tabelas principais.

6. **Pós-processamento**:
   - Atualiza valores nulos (wildcard) para NULL no banco de dados.
   - Atualiza as visões materializadas `random_locale_indicator` e `random_indicator_cache`.
   - Atualiza o checksum do dataset no banco de dados.
   - Define uma flag para gerar o arquivo de dados completo.

## Tratamento de Erros

- O script utiliza blocos `eval` para capturar e registrar erros durante o processo de importação.
- Em caso de erro fatal, o script é encerrado com código de saída 255.

## Observações Importantes

- O script utiliza tabelas temporárias para otimizar a inserção em lote dos dados, porém ainda leva certa de 1h até 3h para rodar, dependendo do hardware.
> Embora o script faça esse processamento, se ele fosse re-feito hoje, poderia ser otimizado utilizando `duckdb` para importar boa parte dos dados e tratamentos, depois só exportar novamente para o disco o que mudou, e importar no postgres.
- O script lida com diferentes formatos numéricos, realizando conversões necessárias.
    > Há várias regexp's para tentar lidar com os números dos CSV's que as vezes estão em pt-br e outras vezes em formato americano. Isso é um pouco arriscado, o ideal é que os CSV's já chegassem sempre no mesmo formato, assim apenas o script poderia sempre criar uma exception caso aparecesse uma linha fora do padrão, e não ter que tentar corrigir o número, podendo gerar um número diferente do correto.
- Há verificações para evitar duplicação de dados durante a importação.
- Utiliza-se um sistema de deduplicação baseado em chaves para evitar entradas duplicadas.
    > Para reduzir o uso de memoria durante o script, pode-se reverter o commit `0458ec4` que utilizava o DB_File com memory-map em disco para este hash do dedup.

## Execução

Pode ser chamado manualmente ou agendado para execução periódica, dependendo da frequência de atualização dos dados.
Como o arquivo que ele está olhando está dentro do próprio repositório, então a executadão esta sendo feita manualmente.

Os arquivos geralmente são recebidos em varios arquivos separados em UTF-8 com BOM, então para remover o BOM e juntar em um arquivo só:

    $ file *

    1.csv:              Unicode text, UTF-8 (with BOM) text, with very long lines (3099), with CRLF line terminators
    2.csv:              Unicode text, UTF-8 (with BOM) text, with very long lines (3099), with CRLF line terminators
    3.csv:              Unicode text, UTF-8 (with BOM) text, with very long lines (3099), with CRLF line terminators
    4.csv:              Unicode text, UTF-8 (with BOM) text, with very long lines (3099), with CRLF line terminators
    Desagregadores.csv: Unicode text, UTF-8 (with BOM) text, with CRLF line terminators
    Indicadores.csv:    Unicode text, UTF-8 (with BOM) text, with very long lines (563), with CRLF, LF line terminators


Rodar o comando `sed`

    sed -i '1s/^\xEF\xBB\xBF//' *.csv


Após executar, os arquivos devem ficar:

    $ file *

    1.csv:              ASCII text, with very long lines (3099), with CRLF line terminators
    2.csv:              ASCII text, with very long lines (3099), with CRLF line terminators
    3.csv:              ASCII text, with very long lines (3099), with CRLF line terminators
    4.csv:              ASCII text, with very long lines (3099), with CRLF line terminators
    Desagregadores.csv: Unicode text, UTF-8 text, with CRLF line terminators
    Indicadores.csv:    Unicode text, UTF-8 text, with very long lines (563), with CRLF, LF line terminators

E então juntar o arquivo de dados:

    $ cat 1.csv 2.csv 3.csv 4.csv > dados.csv
    $ rm 1.csv 2.csv 3.csv 4.csv
    $ mv Desagregadores.csv desagregadores.csv
    $ mv Indicadores.csv indicadores.csv
    $ zip -7 -m -r versao-XXX.zip *

Mover o zip gerado para @omlpi-api / `resources/dataset/` e apontar o link simbólico `latest` para o arquivo novo


    $ mv $path-da-versao.zip $path-para-o-repo/resources/dataset/
    $ cd $path-para-o-repo/resources/dataset/
    $ rm latest; ln -s v15.zip latest
    $ git add .; git commit -m 'Nova versão';


