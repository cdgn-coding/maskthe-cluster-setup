install:
	helm repo add prometheus-community https://prometheus-community.github.io/helm-charts
	helm install --set adminPassword=admin monitoring prometheus-community/kube-prometheus-stack

setup:
	kubectl apply -f ./crd/traefik
	kubectl apply -f ./crd/rabbitmq

deploy:
	pulumi up -y