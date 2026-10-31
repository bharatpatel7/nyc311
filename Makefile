.PHONY: help \
	down downv downV \
	up build \
	ps \
	ports ports-kill ports-kill-frontend ports-kill-backend ports-kill-ingestor ports-kill-db \
	restart restart-frontend restart-backend restart-ingestor restart-db \
	logs logs-frontend logs-backend logs-ingestor \
	prune clean nuke \
	test test-frontend test-backend test-ingestor test-ingestor-pytest\
	gradle-clear-cache \
	lint lint-frontend lint-backend lint-ingestor lint-f-ingestor\
	ci ci-frontend ci-backend ci-ingestor \
	reports reports-frontend reports-backend reports-test-backend reports-jacoco-backend reports-ingestor reports-t-ingestor \
	db db-schema db-tables db-user db-count db-grants db-purge db-purge-complaints db-purge-refresh db-seed-refresh \
	deploy deploy-up deploy-down deploy-build deploy-restart deploy-logs deploy-ps deploy-clean deploy-nuke \
	files files-frontend files-backend files-ingestor \
	deploy-files-frontend deploy-files-backend deploy-files-ingestor

help:
	@echo ""
	@echo "Usage: make <target>"
	@echo ""
	@echo "  down                        docker compose down"
	@echo "  downv                       docker compose down -v"
	@echo "  downV                       docker compose down -V"
	@echo ""
	@echo "  build                       docker compose up --build -d"
	@echo "  up                          docker compose up -d"
	@echo ""
	@echo "  ps                          docker compose ps"
	@echo ""
	@echo "  ports                       show all open ports"
	@echo "  ports-kill                  stop all services and free all ports"
	@echo "  ports-kill-frontend         stop frontend and free port 3000"
	@echo "  ports-kill-backend          stop backend and free port 8080"
	@echo "  ports-kill-ingestor         stop ingestor and free port 8001"
	@echo "  ports-kill-db               stop database and free port 3306"
	@echo ""
	@echo "  restart                     docker compose restart"
	@echo "  restart-frontend            restart frontend service"
	@echo "  restart-backend             restart backend service"
	@echo "  restart-ingestor            restart ingestor service"
	@echo "  restart-db                  restart database service"
	@echo ""
	@echo "  logs                        docker compose logs -f"
	@echo "  logs-frontend               tail frontend logs"
	@echo "  logs-backend                tail backend logs"
	@echo "  logs-ingestor               tail ingestor logs"
	@echo "  logs-db                     tail database logs"
	@echo ""
	@echo "  prune                       docker system prune -f"
	@echo "  clean                       docker compose down -v --remove-orphans"
	@echo "  nuke                        docker compose down -v --remove-orphans --rmi all"
	@echo ""
	@echo "  test                        run all tests"
	@echo "  test-frontend               run frontend tests"
	@echo "  test-backend                run backend tests"
	@echo "  test-ingestor               run ingestor tests"
	@echo "  test-ingestor-pytest        run ingestor tests using pytest"
	@echo ""
	@echo "  gradle-clear-cache          clear stale Gradle lock files in backend container"
	@echo ""
	@echo "  lint                        lint all services"
	@echo "  lint-frontend               lint frontend"
	@echo "  lint-backend                lint backend"
	@echo "  lint-ingestor               lint ingestor"
	@echo "  lint-f-ingestor             format with black"
	@echo ""
	@echo "  ci                          run full ci check (lint + test)"
	@echo "  ci-frontend                 ci check frontend"
	@echo "  ci-backend                  ci check backend"
	@echo "  ci-ingestor                 ci check ingestor"
	@echo ""
	@echo "  reports                     all reports"
	@echo "  reports-frontend            frontend coverage report"
	@echo "  reports-backend             all backend reports"
	@echo "  reports-test-backend        backend test report"
	@echo "  reports-jacoco-backend      backend coverage report"
	@echo "  reports-ingestor            ingestor coverage report"
	@echo "  reports-t-ingestor          ingestor coverage terminal report"
	@echo ""
	@echo "  db                          connect to the database"
	@echo "  db-tables                   list all tables"
	@echo "  db-schema                   show table schemas"
	@echo "  db-users                    list database users (requires root)"
	@echo "  db-grants                   show grants for dev user (requires root)"
	@echo "  db-status                   show database status"
	@echo "  db-count                    row counts for all tables"
	@echo "  db-refresh           		 show last 10 refresh logs"
	@echo "  db-recent-refresh           show last 5 refresh logs"
	@echo "  db-purge                    truncate all tables"
	@echo "  db-purge-complaints         truncate complaints table"
	@echo "  db-purge-refresh            truncate data_refresh_log table"
	@echo "  db-seed-refresh             insert a fake SUCCESS refresh log row"
	@echo ""
	@echo "  deploy                      build and start production stack"
	@echo "  deploy-up                   start production stack (no build)"
	@echo "  deploy-down                 stop production stack"
	@echo "  deploy-build                rebuild and restart production stack"
	@echo "  deploy-restart              restart production stack"
	@echo "  deploy-logs                 tail production logs"
	@echo "  deploy-ps                   show production container status"
	@echo "  deploy-clean                stop production stack and remove volumes"
	@echo "  deploy-nuke                 stop production stack, remove volumes and images"
	@echo ""
	@echo "  files                       list files in all dev containers"
	@echo "  files-frontend              list files in dev frontend container"
	@echo "  files-backend               list files in dev backend container"
	@echo "  files-ingestor              list files in dev ingestor container"
	@echo ""
	@echo "  deploy-files                list files in all production containers"
	@echo "  deploy-files-frontend       list files in production frontend container"
	@echo "  deploy-files-backend        list files in production backend container"
	@echo "  deploy-files-ingestor       list files in production ingestor container"
	@echo ""

up:
	docker compose up -d
down:
	docker compose down
downv:
	docker compose down -v
downV:
	docker compose down -V
build:
	docker compose up --build -d

ps:
	docker compose ps
ports:
	docker compose ps --format "table {{.Name}}\t{{.Ports}}"
ports-kill:
	docker compose down
ports-kill-frontend:
	docker compose stop frontend
ports-kill-backend:
	docker compose stop backend
ports-kill-ingestor:
	docker compose stop ingestor
ports-kill-db:
	docker compose stop db

restart:
	docker compose restart
restart-frontend:
	docker compose restart frontend
restart-backend:
	docker compose restart backend
restart-ingestor:
	docker compose restart ingestor
restart-db:
	docker compose restart db

logs:
	docker compose logs -f
logs-frontend:
	docker compose logs -f frontend
logs-backend:
	docker compose logs -f backend
logs-ingestor:
	docker compose logs -f ingestor
logs-db:
	docker compose logs -f db

prune:
	docker system prune -f
clean:
	docker compose down -v --remove-orphans
nuke:
	docker compose down -v --remove-orphans --rmi all

test: test-frontend test-backend test-ingestor
test-frontend:
	docker compose run --rm frontend npm test
test-backend:
	docker compose run --rm backend sh -c "rm -rf /app/.gradle/* /app/.gradle/.[!.]* 2>/dev/null; ./gradlew test --no-daemon"
test-ingestor:
	docker compose --profile test run --rm ingestor-test
test-ingestor-pytest:
	docker compose run --rm ingestor pytest

gradle-clear-cache:
	docker compose exec backend rm -rf /app/.gradle

lint: lint-frontend lint-backend lint ingestor
lint-frontend:
	docker compose exec frontend npm run lint
lint-backend:
	docker compose exec backend ./gradlew checkstyleMain
lint-ingestor:
	docker compose exec ingestor black --check .
format-ingestor:
	docker compose exec ingestor black .

ci: ci-frontend ci-backend ci-ingestor
ci-frontend:
	docker compose run --rm frontend sh -c "npm ci && npm run ci"
ci-backend:
	docker compose exec backend ./gradlew check
ci-ingestor:
	cd ingestor && git diff --exit-code
	docker compose exec ingestor sh -c "black . && pytest"

reports: reports-frontend reports-backend reports-ingestor
reports-frontend:
	docker compose exec frontend npm run test:coverage
	open frontend/coverage/lcov-report/index.html
reports-backend: reports-test-backend reports-jacoco-backend
reports-test-backend:
	docker compose exec backend ./gradlew test
	open backend/build/reports/tests/test/index.html
reports-jacoco-backend:
	docker compose exec backend ./gradlew jacocoTestReport
	open backend/build/reports/jacoco/test/html/index.html
reports-ingestor:
	docker compose exec -e COVERAGE_FILE=/tmp/.coverage ingestor \
		pytest --cov --cov-report=html:/tmp/htmlcov
	docker compose cp ingestor:/tmp/htmlcov ingestor/htmlcov
	open ingestor/htmlcov/index.html
reports-t-ingestor:
	docker compose exec -e COVERAGE_FILE=/tmp/.coverage ingestor \
		pytest --cov --cov-report=term-missing

db:
	docker compose exec db mariadb -udev -pdev devdb
db-tables:
	docker compose exec db mariadb -udev -pdev devdb -e "SHOW TABLES;"
db-schema:
	docker compose exec db mariadb-dump -udev -pdev --no-data devdb
db-users:
	docker compose exec db mariadb -uroot -p$$(grep DB_ROOT_PASSWORD .env | cut -d= -f2) -e "SELECT user, host FROM mysql.user;"
db-grants:
	docker compose exec db mariadb -uroot -p$$(grep DB_ROOT_PASSWORD .env | cut -d= -f2) -e "SHOW GRANTS FOR 'dev'@'%';"
db-status:
	docker compose exec db mariadb -udev -pdev -e "SHOW STATUS LIKE 'Threads_connected'; SHOW STATUS LIKE 'Uptime'; SHOW STATUS LIKE 'Questions';"
db-count:
	docker compose exec db mariadb -udev -pdev devdb -e "SELECT COUNT(*) AS complaints FROM complaints; SELECT COUNT(*) AS refreshes FROM data_refresh_log;"
db-refresh:
	docker compose exec db mariadb -udev -pdev devdb -e "SELECT * FROM data_refresh_log ORDER BY refresh_completed_at DESC LIMIT 10;"
db-recent-refresh:
	docker compose exec db mariadb -udev -pdev devdb -e "SELECT * FROM data_refresh_log ORDER BY refresh_completed_at DESC LIMIT 5;"
db-purge-complaints:
	docker compose exec db mariadb -udev -pdev devdb -e "TRUNCATE TABLE complaints;"
db-purge-refresh:
	docker compose exec db mariadb -udev -pdev devdb -e "TRUNCATE TABLE data_refresh_log;"
db-purge:
	docker compose exec db mariadb -udev -pdev devdb -e "TRUNCATE TABLE complaints; TRUNCATE TABLE data_refresh_log;"
db-seed-refresh:
	docker compose exec db mariadb -udev -pdev devdb -e "INSERT INTO data_refresh_log (refresh_started_at, refresh_completed_at, records_processed, status) VALUES (NOW(), NOW(), 999, 'SUCCESS');"

deploy:
	docker compose -f docker-compose.deploy.yml up --build -d
deploy-up:
	docker compose -f docker-compose.deploy.yml up -d
deploy-down:
	docker compose -f docker-compose.deploy.yml down
deploy-build:
	docker compose -f docker-compose.deploy.yml up --build -d
deploy-restart:
	docker compose -f docker-compose.deploy.yml restart
deploy-logs:
	docker compose -f docker-compose.deploy.yml logs -f
deploy-ps:
	docker compose -f docker-compose.deploy.yml ps
deploy-clean:
	docker compose -f docker-compose.deploy.yml down -v --remove-orphans
deploy-nuke:
	docker compose -f docker-compose.deploy.yml down -v --remove-orphans --rmi all

deploy-files:
	cd frontend && npm run build && find build -type f | grep index.htmlview-db:
	docker compose exec db mariadb -u$$(grep DB_USER .env | cut -d= -f2) -p$$(grep DB_PASSWORD .env | cut -d= -f2) $$(grep DB_NAME .env | cut -d= -f2)

files: files-frontend files-backend files-ingestor
files-frontend:
	docker compose exec frontend find /app -type f -not -path "*/node_modules/*"
files-backend:
	docker compose exec backend find /app -type f -not -path "*/.gradle/*" -not -path "*/build/*"
files-ingestor:
	docker compose exec ingestor find /app -type f

deploy-files: deploy-files-frontend deploy-files-backend deploy-files-ingestor
deploy-files-frontend:
	docker compose -f docker-compose.deploy.yml exec proxy find /app -type f -not -path "*/node_modules/*"
deploy-files-backend:
	docker compose -f docker-compose.deploy.yml exec backend find /app -type f -not -path "*/.gradle/*" -not -path "*/build/*"
deploy-files-ingestor:
	docker compose -f docker-compose.deploy.yml exec ingestor find /app -type f
