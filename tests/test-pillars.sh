#!/bin/bash

BASE=http://localhost:3000

echo "== 0) Health check =="
curl -s $BASE/; echo -e "\n"

echo "== 1) Cadastro de usuario comum =="
curl -s -X POST $BASE/api/auth/register -H "Content-Type: application/json" \
  -d '{"username":"grupo1","password":"senhaForte123"}'; echo -e "\n"

echo "== 2) Cadastro de administrador =="
curl -s -X POST $BASE/api/auth/register -H "Content-Type: application/json" \
  -d '{"username":"admin1","password":"senhaAdmin123","role":"admin"}'; echo -e "\n"

echo "== 3) Login com senha errada =="
curl -s -X POST $BASE/api/auth/login -H "Content-Type: application/json" \
  -d '{"username":"grupo1","password":"senhaErrada"}'; echo -e "\n"

echo "== 4) Login correto =="
LOGIN_RESP=$(curl -s -X POST $BASE/api/auth/login -H "Content-Type: application/json" \
  -d '{"username":"grupo1","password":"senhaForte123"}')
echo "$LOGIN_RESP"
TOKEN=$(echo "$LOGIN_RESP" | node -e "let d='';process.stdin.on('data',c=>d+=c);process.stdin.on('end',()=>console.log(JSON.parse(d).token))")
echo -e "\n"

echo "== 5) Acesso sem token =="
curl -s -o /dev/null -w "status: %{http_code}\n" $BASE/api/emergy; echo -e "\n"

echo "== 6) Criar dado emergetico =="
curl -s -X POST $BASE/api/emergy -H "Content-Type: application/json" -H "Authorization: Bearer $TOKEN" \
  -d '{"description":"Diesel consumido no processo","value":123456.78,"unit":"seJ"}'; echo -e "\n"

echo "== 7) Listar dados =="
curl -s $BASE/api/emergy -H "Authorization: Bearer $TOKEN"; echo -e "\n"

echo "== 8) Tentativa de SQL Injection =="
curl -s -X POST $BASE/api/auth/login -H "Content-Type: application/json" \
  -d "{\"username\":\"grupo1' OR '1'='1\",\"password\":\"qualquer12345\"}"; echo -e "\n"

echo "== 9) Usuario comum tentando deletar =="
curl -s -X DELETE $BASE/api/emergy/1 -H "Authorization: Bearer $TOKEN"; echo -e "\n"

echo "== 10) Simulacao de forca bruta =="
for i in 1 2 3 4 5 6 7; do
  curl -s -o /dev/null -w "tentativa $i -> status %{http_code}\n" \
    -X POST $BASE/api/auth/login -H "Content-Type: application/json" \
    -d "{\"username\":\"grupo1\",\"password\":\"senhaErrada$i\"}"
done
echo -e "\n"

echo "== Ultimas linhas do log =="
tail -10 logs/access.log
