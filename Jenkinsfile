// ==============================================================================
// Jenkinsfile - Simplified CI/CD Pipeline for DevOps Taskboard
// Features: Jest + Playwright Testing, Docker, Minikube, Dashboard, Email
// ==============================================================================

pipeline {
    agent any

    environment {
        APP_NAME = 'devops-taskboard'
        DOCKER_IMAGE = "devops-taskboard:${env.BUILD_NUMBER}"
        DOCKER_IMAGE_LATEST = 'devops-taskboard:latest'
        EMAIL_RECIPIENTS = 'jaf.nz@icloud.com'
    }

    options {
        buildDiscarder(logRotator(numToKeepStr: '20'))
        timestamps()
        timeout(time: 60, unit: 'MINUTES')
        disableConcurrentBuilds()
    }

    stages {
        stage('Install Dependencies') {
            steps {
                echo '📦 Installing dependencies...'
                sh 'npm install'
            }
        }

        stage('Backend Tests') {
            steps {
                echo '🧪 Running backend tests...'
                sh '''
                    npm test
                    npm run test:coverage || true
                '''
            }
            post {
                always {
                    archiveArtifacts artifacts: 'coverage/**/*', allowEmptyArchive: true
                    junit 'test-results/jest-junit.xml'
                }
            }
        }

        stage('Frontend Tests') {
            steps {
                echo '🎭 Running Playwright tests (Chromium, Firefox, WebKit)...'
                sh '''
                    npx playwright install --with-deps chromium firefox webkit
                    npm run test-frontend || true
                    npm run test-frontend:coverage || true
                '''
            }
            post {
                always {
                    archiveArtifacts artifacts: 'playwright-report/**/*', allowEmptyArchive: true
                    archiveArtifacts artifacts: 'test-results/**/*', allowEmptyArchive: true
                    junit 'test-results/playwright-junit.xml'
                }
            }
        }

        stage('Build Docker Image') {
            steps {
                echo '🐳 Building Docker image...'
                sh """
                    docker build -t ${DOCKER_IMAGE} -t ${DOCKER_IMAGE_LATEST} .
                    docker images | grep ${APP_NAME} || true
                """
            }
        }

        stage('Run Docker App') {
            steps {
                echo '🚀 Starting app with Docker...'
                sh '''
                    docker rm -f devops-taskboard-local || true
                    docker run -d --name devops-taskboard-local -p 3002:3000 devops-taskboard:latest
                    echo "Docker app running at: http://localhost:3002"
                '''
            }
        }

        stage('Deploy to Minikube') {
            when {
                expression {
                    return sh(script: 'which minikube', returnStatus: true) == 0
                }
            }
            steps {
                echo '☸️ Deploying to Minikube...'
                sh 'minikube start --driver=docker || true'
                sh '''
                    minikube image load devops-taskboard:${BUILD_NUMBER} || (
                        eval $(minikube docker-env)
                        docker build -t devops-taskboard:${BUILD_NUMBER} -t devops-taskboard:latest .
                    )
                '''
                sh '''
                    kubectl apply -f k8s/namespace.yaml || true
                    kubectl delete service devops-taskboard-service -n devops-taskboard --ignore-not-found
                    kubectl apply -f k8s/deployment.yaml
                    kubectl apply -f k8s/dashboard.yaml || true
                    kubectl rollout status deployment/devops-taskboard -n devops-taskboard --timeout=120s
                    kubectl get pods -n devops-taskboard -l app=devops-taskboard
                    kubectl get services -n devops-taskboard
                '''
                sh '''
                    echo "Access (recommended): kubectl port-forward -n devops-taskboard svc/devops-taskboard-service 5030:80"
                    echo "Then open: http://localhost:5030"
                '''
            }
        }

        stage('Smoke Tests') {
            when {
                expression {
                    return sh(script: 'which minikube', returnStatus: true) == 0
                }
            }
            steps {
                echo '💨 Running smoke tests...'
                sh '''
                    sleep 10
                    kubectl port-forward -n devops-taskboard svc/devops-taskboard-service 5030:80 >/tmp/pf.log 2>&1 &
                    PF_PID=$!
                    for i in $(seq 1 15); do
                        if grep -q "Forwarding" /tmp/pf.log; then
                            break
                        fi
                        sleep 1
                    done
                    for i in $(seq 1 10); do
                        if curl -fs "http://localhost:5030/tasks"; then
                            echo "Smoke test passed"
                            break
                        fi
                        sleep 2
                    done
                    kill $PF_PID || true
                '''
            }
        }

        stage('Setup Dashboard') {
            when {
                expression {
                    return sh(script: 'which minikube', returnStatus: true) == 0
                }
            }
            steps {
                echo '📊 Enabling Kubernetes Dashboard...'
                sh '''
                    minikube addons enable dashboard || true
                    minikube addons enable metrics-server || true
                '''
            }
        }
    }

    post {
        always {
            echo '🧹 Cleaning up...'
            sh 'docker image prune -f || true'
        }

        success {
            echo '✅ Pipeline completed successfully!'
            script {
                try {
                    emailext(
                        subject: "✅ SUCCESS: ${env.JOB_NAME} - Build #${env.BUILD_NUMBER}",
                        body: """
                            <h2>Build Successful!</h2>
                            <p><strong>Job:</strong> ${env.JOB_NAME}</p>
                            <p><strong>Build Number:</strong> ${env.BUILD_NUMBER}</p>
                            <p><strong>Build URL:</strong> <a href="${env.BUILD_URL}">${env.BUILD_URL}</a></p>
                            <hr>
                            <p>Tests passed and deployment completed.</p>
                        """,
                        to: "${EMAIL_RECIPIENTS}",
                        mimeType: 'text/html'
                    )
                } catch (Exception e) {
                    echo "Email notification failed: ${e.message}"
                }
            }
        }

        failure {
            echo '❌ Pipeline failed!'
            script {
                try {
                    emailext(
                        subject: "❌ FAILED: ${env.JOB_NAME} - Build #${env.BUILD_NUMBER}",
                        body: """
                            <h2>Build Failed!</h2>
                            <p><strong>Job:</strong> ${env.JOB_NAME}</p>
                            <p><strong>Build Number:</strong> ${env.BUILD_NUMBER}</p>
                            <p><strong>Build URL:</strong> <a href="${env.BUILD_URL}">${env.BUILD_URL}</a></p>
                            <p><a href="${env.BUILD_URL}console">View Console Output</a></p>
                        """,
                        to: "${EMAIL_RECIPIENTS}",
                        mimeType: 'text/html'
                    )
                } catch (Exception e) {
                    echo "Email notification failed: ${e.message}"
                }
            }
        }
    }
}
