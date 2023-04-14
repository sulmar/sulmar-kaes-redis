## Zadanie  1

### Problem

Utwórz usługę do wiekowania płatności.

Należności przeterminowane

| kontrahent | 1-60 dni  | 62-180 dni | 181-360 dni | > 361 dni |
|------------|-----------|------------|-------------|-----------|
| c:1        | fv:1,fv:2 |            | fv:7        | fv:9      |
| c:2        | fv:3      | fv:4,fv:5  | fv:8        |           |
| c:3        |           | fv:6       |             | fv:10     |
|            |           |            |             |           |
|            | ...       | ...        | ...         | ...       |


- Pobranie należności przeterminowanych z danego przedziału dla kontrahenta
~~~
GET /customers/{id}/overdue/{range}
Accept: application/json
~~~

- Pobranie wszystkich należności przeterminowanych dla kontrahenta
~~~
GET /customers/{id}/overdue/all
Accept: application/json
~~~


### Rozwiązanie

Możemy użyć struktury zbioru (SET). 
Każdy przedział traktujemy jako zbiór faktur.

- Dodanie danych
~~~
 SADD c:1:1-60days fv:1 fv:2
 SADD c:1:181-360days fv:7
 SADD c:1:above361days fv:9
 ~~~

- Pobranie wszystkich należności przeterminowanych dla kontrahenta
~~~
SUNION  c:1:1-60days c:1:61-180days c:1:181-360days c:1:above361days
~~~

- Zapisanie i pobranie wszystkich należności przeterminowanych dla kontrahenta
~~~
SUNIONSTORE c:1:all  c:1:1-60days c:1:61-180days c:1:181-360days c:1:above361days
SMEMBERS c:1:all
~~~


## Zadanie 2

### Problem

Utwórz usługę do obsługi plan kont z użyciem REDIS. 


| Symbol | Nazwa                        | Winien | Ma  | 
|--------|------------------------------|--------|-----|
| 010    | Środki trwałe                | 22000  |     |
| 100    | Kasa                         |        |     |
| 130    | Rachunek bieżący             |        |     |
| 310    | Materiały                    | 750    |     |
| ...    | ...                          | ...    | ... |

- Pobranie informacji o koncie
~~~
GET /accounts/{symbol}
Accept: application/json
~~~

- Dodanie operacji
~~~
POST /accounts/{symbol}/operations
Content-Type: application/json
{"amount": 100, "description": "Zakupiono maszynę"}
~~~

- Operacja 1. Wpłacono 1200 zł z kasy na rachunek bieżący (Raport kasowy)
- Operacja 2. Zakupiono materiały ze środków z rachunku bieżącego netto 750 zł
- Operacja 3. Zakupiono maszynę o wartości netto 9000 zł 
- Operacja 4. Zakupiono maszynę o wartości netto 13000 zł

### Rozwiązanie

Możemy użyć tablicy asocjacyjnej (HASH).
Klucz będzie kontem księgowym.
~~~
HSET account:010 Nazwa "Srodki trwale" Wn 22000 Ma 0
HSET account:100 Nazwa "Kasa" Wn 0 Ma 0
HSET account:100 100 Nazwa "Kasa" Wn 0 Ma 0
HSET account:310 Nazwa "Materialy" Wn 750 Ma 0
~~~

- Operacja 1. Wpłacono 1200 zł z kasy na rachunek bieżący (Raport kasowy)
~~~
HINCRBY account:130 Ma 1200
~~~

- Operacja 2. Zakupiono materiały ze środków z rachunku bieżącego netto 750 zł
~~~
MULTI
HINCRBY account:130 Ma -750
HINCRBY account:310 Wn 750
EXEC
~~~


## Zadanie 3


### Problem

Utwórz aplikację konsolową do obsługi **magazynu kontenerowego**

![Kontenery](https://silvan-logistics.com/wp-content/uploads/2022/02/magazyn-kontenerowy-1.jpg)

Wymagania:
- umieszczenie kontenera w określonym miejscu
- pobranie kontenera w określonym miejscu
- obliczenie ilości kontenerów w określonym miejscu
- pobranie listy kontenerów w określonym miejscu

### Rozwiązanie

Możemy użyć list (LIST).

Kontenery ustawiamy na stosie. Każdy stos ma określone położenie X i Y.

- Umieszczamy kontenery na stosie w określonym miejscu 
~~~

LPUSH place:A:1 c:1
LPUSH place:A:2 c:2
LPUSH place:A:3 c:3
LPUSH place:A:4 c:4

LPUSH place:B:2 c:5
LPUSH place:B:2 c:6
LPUSH place:B:2 c:7
~~~

- Zdjęcie kontenera w podanym miejscu
~~~
LPOP place:B:2
~~~

- Obliczenie ilości kontenerów w podanym miejscu
~~~
LLEN place:B:2
~~~

- Pobranie listy kontenerów w określonym miejscu
~~~
LRANGE place:B:2 0 -1
~~~



## Zadanie 4

### Problem

![Kanban board](https://talentvis.com/files/images/blog/2022/05/what-you-need-to-know-about-kanban-board.jpg)

### Rozwiązanie

Możemy użyć zbioru (SET). Każdy etap traktujemy jako zbiór:

- Dodajemy zadania do backlogu
~~~
SADD kanban-board:backlog t:1 t:2 t:3 t:4
~~~

- Przenosimy wybrane zadania do realizacji
~~~
SMOVE kanban-board:backlog kanban-board:work-in-progress t:2
SMOVE kanban-board:backlog kanban-board:work-in-progress t:3
~~~

- Obliczamy ilość zadań w trakcie realizacji
~~~
SCARD kanban-board:work-in-progress
~~~

- Przenosimy wybrane zadania do walidacji
~~~
SMOVE kanban-board:work-in-progress kanban-board:validate t:2
~~~

- Przenosimy zadanie do zrealizowanych
~~~
SMOVE kanban-board:validate kanban-board:complete t:2
~~~