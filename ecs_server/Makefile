devserver:
	flask --app fjalle_backend --debug run

runserver:
	gunicorn -w 4 -b 0.0.0.0:5000 fjalle_backend:app

source:
	source backend/bin/activate

requirements:
	pip freeze > requirements.txt