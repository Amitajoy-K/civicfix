// ========================================================
// CivicFix CI/CD Automated Pipeline
// Subject: DevOps & Continuous Delivery
// Workflow: Git -> GitHub -> Jenkins -> Build -> Test -> Docker -> Deploy
// ========================================================

pipeline {
    agent any

    environment {
        DOCKER_IMAGE_TAG = "civicfix/app:${BUILD_NUMBER}"
        DOCKER_REGISTRY  = "registry.civicfix.cloud"
        CONTAINER_NAME   = "civicfix-app-live"
        APP_PORT         = "3000"
    }

    stages {
        // Stage 1: Checkout Source Code
        stage('1. Checkout Code') {
            steps {
                echo 'Pulling latest commit from repository...'
                checkout scm
            }
        }

        // Stage 2: Install Dependencies
        stage('2. Install Dependencies') {
            steps {
                echo 'Installing application and build dependencies...'
                sh 'npm ci'
            }
        }

        // Stage 3: Lint & Type Validation
        stage('3. Compile & TypeCheck') {
            steps {
                echo 'Running strict TypeScript compilation checks...'
                sh 'npm run lint'
            }
        }

        // Stage 4: Run Automated Tests
        stage('4. Run Tests') {
            steps {
                echo 'Executing unit and integration verification suite...'
                sh 'npm test --if-present'
            }
        }

        // Stage 5: Build Application Artifacts
        stage('5. Build Application') {
            steps {
                echo 'Building production bundle and server executable...'
                sh 'npm run build'
            }
        }

        // Stage 6: Build Docker Image
        stage('6. Build Docker Image') {
            steps {
                echo "Building hardened Docker image: ${DOCKER_IMAGE_TAG}..."
                sh "docker build -t ${DOCKER_IMAGE_TAG} -t civicfix/app:latest ."
            }
        }

        // Stage 7: Deploy Container to Environment
        stage('7. Deploy Container') {
            steps {
                echo 'Deploying containerized service to runtime cluster...'
                script {
                    sh """
                        # Graceful container recycling
                        docker stop ${CONTAINER_NAME} || true
                        docker rm ${CONTAINER_NAME} || true
                        docker run -d --name ${CONTAINER_NAME} \
                          -p ${APP_PORT}:3000 \
                          --restart unless-stopped \
                          civicfix/app:latest
                    """
                }
                echo 'Verifying deployment health...'
                sh "curl -f http://localhost:${APP_PORT}/api/health || exit 1"
            }
        }
    }

    post {
        success {
            echo '====================================================='
            echo "CI/CD SUCCESS: CivicFix Build #${BUILD_NUMBER} deployed successfully!"
            echo '====================================================='
        }
        failure {
            echo '====================================================='
            echo "CI/CD FAILURE: CivicFix Build #${BUILD_NUMBER} failed. Notifying team."
            echo '====================================================='
        }
    }
}
