#!/bin/bash

BASE=https://localhost:3000
CURL="curl -sk"

echo "== 0) Health check =="
$CURL $BASE/; echo -e "\n"

echo "== 0.1) Criacao de administrador (fora da API publica, via script de seed) =="
node scripts/create-admin.js admin1 senhaAdmin123; echo -e "\n"

echo "== 1) Cadastro de usuario comum =="
$CURL -X POST $BASE/api/auth/register -H "Content-Type: application/json" \
  -d '{"username":"grupo1","password":"senhaForte123"}'; echo -e "\n"

echo "== 2) Tentativa de se autopromover a admin no cadastro (deve ser ignorada) =="
$CURL -X POST $BASE/api/auth/register -H "Content-Type: application/json" \
  -d '{"username":"grupo2","password":"senhaForte123","role":"admin"}'; echo -e "\n"

echo "== 3) Login com senha errada =="
$CURL -X POST $BASE/api/auth/login -H "Content-Type: application/json" \
  -d '{"username":"grupo1","password":"senhaErrada"}'; echo -e "\n"

echo "== 4) Login correto =="
LOGIN_RESP=$($CURL -X POST $BASE/api/auth/login -H "Content-Type: application/json" \
  -d '{"username":"grupo1","password":"senhaForte123"}')
echo "$LOGIN_RESP"
TOKEN=$(echo "$LOGIN_RESP" | node -e "let d='';process.stdin.on('data',c=>d+=c);process.stdin.on('end',()=>console.log(JSON.parse(d).token))")
echo -e "\n"

echo "== 5) Acesso sem token =="
$CURL -o /dev/null -w "status: %{http_code}\n" $BASE/api/emergy; echo -e "\n"

echo "== 6) Criar dado emergetico =="
$CURL -X POST $BASE/api/emergy -H "Content-Type: application/json" -H "Authorization: Bearer $TOKEN" \
  -d '{"description":"Diesel consumido no processo","value":123456.78,"unit":"seJ"}'; echo -e "\n"

echo "== 7) Listar dados =="
$CURL $BASE/api/emergy -H "Authorization: Bearer $TOKEN"; echo -e "\n"

echo "== 8) Tentativa de SQL Injection =="
$CURL -X POST $BASE/api/auth/login -H "Content-Type: application/json" \
  -d "{\"username\":\"grupo1' OR '1'='1\",\"password\":\"qualquer12345\"}"; echo -e "\n"

echo "== 9) Usuario comum tentando deletar (deve ser negado) =="
$CURL -X DELETE $BASE/api/emergy/1 -H "Authorization: Bearer $TOKEN"; echo -e "\n"

echo "== 10) Login como administrador e exclusao do registro =="
ADMIN_LOGIN_RESP=$($CURL -X POST $BASE/api/auth/login -H "Content-Type: application/json" \
  -d '{"username":"admin1","password":"senhaAdmin123"}')
echo "$ADMIN_LOGIN_RESP"
ADMIN_TOKEN=$(echo "$ADMIN_LOGIN_RESP" | node -e "let d='';process.stdin.on('data',c=>d+=c);process.stdin.on('end',()=>console.log(JSON.parse(d).token))")
$CURL -X DELETE $BASE/api/emergy/1 -H "Authorization: Bearer $ADMIN_TOKEN"; echo -e "\n"

echo "== 11) Administrador consultando logs de auditoria =="
$CURL "$BASE/api/admin/logs?limit=15" -H "Authorization: Bearer $ADMIN_TOKEN"; echo -e "\n"

echo "== 12) Simulacao de forca bruta (bloqueio por usuario apos exceder tentativas; roda por ultimo pois tambem consome o limite por IP) =="
for i in 1 2 3 4 5 6 7; do
  $CURL -o /dev/null -w "tentativa $i -> status %{http_code}\n" \
    -X POST $BASE/api/auth/login -H "Content-Type: application/json" \
    -d "{\"username\":\"grupo1\",\"password\":\"senhaErrada$i\"}"
done
echo -e "\n"

echo "== Ultimas linhas do log =="
tail -10 logs/access.log
