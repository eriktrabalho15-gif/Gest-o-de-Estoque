# Revisão do inventário anual de BP — 16/10/2026

## Situação
**Ensaio local disponível. Não liberado para contagem simultânea pela internet.**

Foi preparada uma entrada exclusiva em `inventario-bp.html`, com estoque 300 e tipo Oficial fixos, data sugerida 16/10/2026, botão explícito de salvar contagem e backup completo em JSON. O app geral foi preservado. Nenhum inventário real foi iniciado e nenhuma contagem anterior foi apagada.

## Regras verificadas
- Admin/líder distribui duplas, ruas e etapas; participante atua somente na designação.
- Ordem crescente WMS; itens em várias alocações contados pelo total uma única vez.
- Quantidade zero válida; erro ao gravar preserva o valor anterior.
- Duplas distintas nas recontagens; terceira etapa somente nas divergências.
- Progresso por dupla e geral; valores de outras contagens não aparecem no ambiente do participante.
- Encerramento e exportação final exigem todos os itens apurados.
- Exportação de contagens com responsáveis/data/hora e arquivo de importação SAP com cinco colunas.

## Pendências antes da operação pela internet
1. Implementar base compartilhada e autorização no servidor; o sistema atual permanece em localStorage, com identidade de prévia.
2. Publicar no Sites com acesso restrito e contas ChatGPT dos participantes.
3. Validar em dois aparelhos: gravar simultaneamente, atualizar e confirmar persistência no servidor sem sobrescritas.
4. Validar perda de conexão, mensagens de erro e recuperação de gravação.
5. Cadastrar usuários, duplas e ruas reais; realizar ensaio com a equipe antes do inventário.
6. Carregar o relatório correto antes da abertura: a base atual é de 14/10/2026 à tarde; BP contém 2.021 registros, R$ 1.514.770 (arredondado). O saldo fica congelado no inventário aberto.

## Bloqueios identificados no ambiente de publicação
- O projeto Sites existente foi localizado, ainda sem versão publicada.
- O fluxo oficial de abertura do repositório não conseguiu executar a preparação; diagnóstico de subprocesso Git retornou EPERM.
- O instalador do projeto de servidor também não encontrou npm no ambiente.
- A permissão de rede foi concedida, mas não resolveu os bloqueios acima.

O esqueleto do projeto de servidor foi preparado em work/inventario-bp-online. Ele ainda não contém o backend de inventário e não foi compilado/publicado. A prévia local não representa uma versão online pronta.
