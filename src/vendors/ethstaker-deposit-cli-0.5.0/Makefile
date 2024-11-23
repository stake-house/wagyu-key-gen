VENV_NAME?=venv
VENV_ACTIVATE=. $(VENV_NAME)/bin/activate
PYTHON=${VENV_NAME}/bin/python3.12
DOCKER_IMAGE="eth-educators/ethstaker-deposit-cli:latest"

help:
	@echo "clean - remove build and Python file artifacts"
	# Run with venv
	@echo "venv_deposit - run deposit cli with venv"
	@echo "venv_build - install basic dependencies with venv"
	@echo "venv_build_test - install testing dependencies with venv"
	@echo "venv_lint - check style with flake8 and mypy with venv"
	@echo "venv_test - run tests with venv"

clean:
	rm -rf venv/
	rm -rf build/
	rm -rf dist/
	rm -rf *.egg-info
	rm -rf .tox/
	find . -name __pycache__ -exec rm -rf {} \;
	find . -name .mypy_cache -exec rm -rf {} \;
	find . -name .pytest_cache -exec rm -rf {} \;

$(VENV_NAME)/bin/activate: requirements.txt
	@test -d $(VENV_NAME) || python3 -m venv --clear $(VENV_NAME)
	${VENV_NAME}/bin/python -m pip install -r requirements.txt -r requirements_test.txt
	@touch $(VENV_NAME)/bin/activate

venv_build: $(VENV_NAME)/bin/activate

venv_build_test: venv_build
	${VENV_NAME}/bin/python -m pip install -r requirements.txt -r requirements_test.txt

venv_test: venv_build_test
	$(VENV_ACTIVATE) && python -m pytest ./tests

venv_lint: venv_build_test
	$(VENV_ACTIVATE) && flake8 --config=flake8.ini ./ethstaker_deposit ./tests && mypy --config-file mypy.ini -p ethstaker_deposit

venv_deposit: venv_build
	$(VENV_ACTIVATE) && python -m ethstaker_deposit $(filter-out $@,$(MAKECMDGOALS))

build_macos: venv_build
	${VENV_NAME}/bin/python -m pip install -r ./build_configs/macos/requirements.txt
	export PYTHONHASHSEED=42; \
	$(VENV_ACTIVATE) && pyinstaller ./build_configs/macos/build.spec;

build_linux: venv_build
	${VENV_NAME}/bin/python -m pip install -r ./build_configs/linux/requirements.txt
	export PYTHONHASHSEED=42; \
	$(VENV_ACTIVATE) && pyinstaller ./build_configs/linux/build.spec

build_docker:
	@docker build --pull -t $(DOCKER_IMAGE) .

run_docker:
	@docker run -it --rm $(DOCKER_IMAGE) $(filter-out $@,$(MAKECMDGOALS))
